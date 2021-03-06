console.log("Loaded from domain.js - dsu-explorer-wallet");
const commons = require('./commons');
const constants = require('./constants');

const MARKETPLACE_APP_MANIFEST = "/apps/psk-marketplace-ssapp/manifest";
const CODE_FOLDER = "/code";
const MARKETPLACES_MOUNTING_PATH = "/marketplaces";
const keyssiresolver = require("opendsu").loadApi("resolver");

$$.swarms.describe('readDir', {
    readDir: function(path, options) {
        if (rawDossier) {
            return rawDossier.readDir(path, options, this.return);
        }

        this.return(new Error("Raw Dossier is not available."));
    },
    hasFile: function (path, fileName) {
        if (!rawDossier) {
            return this.return(new Error("Raw Dossier is not available."));
        }

        rawDossier.readDir(path, constants.WITH_FILE_TYPES, (err, { files }) => {
            if (err) {
                return this.return(err);
            }

            const hasFile = files.indexOf(fileName) !== -1;
            this.return(undefined, hasFile);
        });
    },
    start: function(path) {
        if (rawDossier) {
            return rawDossier.readDir(path, constants.WITH_FILE_TYPES, (err, content) => {
                if (err) {
                    return this.return(err);
                }

                this.path = path === '/' ? '' : path;
                this.content = {
                    ...content,
                    applications: []
                };
                this.checkForApplications();
            });
        }

        this.return(new Error("Raw Dossier is not available."));
    },
    checkForApplications: function() {
        const mounts = this.content.mounts;
        const numberOfMounts = mounts.length;
        if (!numberOfMounts ||
            (numberOfMounts === 1 && mounts[0] === constants.CODE)) {
            return this.return(undefined, this.content);
        }

        let sequence = Promise.resolve();
        mounts.forEach((mount) => {
            sequence = sequence.then(() => {
                return new Promise((resolve) => {
                    if (mount !== constants.CODE) {
                        return this.checkForAppFolder(mount, resolve);
                    }
                    resolve();
                })
            })
        });

        sequence.then(() => {
            this.updateMountsList();
        })
    },
    updateMountsList: function() {
        const { mounts, applications } = this.content;
        this.content.mounts = mounts.filter((mountPoint) => {
            let remove = false;
            applications.forEach((appName) => {
                remove = remove || appName === mountPoint;
            });

            return !remove;
        });

        this.return(undefined, this.content);
    },
    checkForAppFolder: function(mountPoint, callback) {
        const wDir = `${this.path}/${mountPoint}`;
        rawDossier.readDir(wDir, constants.WITH_FILE_TYPES, (err, mountPointContent) => {
            if (err) {
                return this.return(err);
            }

            const { folders, mounts } = mountPointContent;
            if (!folders || !folders.length) {
                return this.checkForCodeDossier(mounts, mountPoint, callback);
            }

            const hasAppFolder = folders.findIndex((fName) => fName === constants.APP) !== -1;
            if (!hasAppFolder) {
                return this.checkForIndexHTML(mountPoint, callback);
            }

            this.content.applications.push(mountPoint);

            callback();

        });
    },
    checkForCodeDossier: function(mounts, mountPoint, callback) {
        const hasCodeFolder = mounts.findIndex(mPoint => mPoint === constants.CODE) !== -1;
        if (hasCodeFolder) {
            return this.checkForIndexHTML(mountPoint, callback);
        }

        callback();
    },
    checkForIndexHTML: function(mountPoint, callback) {
        const wDir = `${this.path}/${mountPoint}`;
        rawDossier.readDir(`${wDir}/${constants.CODE}`, constants.WITH_FILE_TYPES, (err, codeContent) => {
            if (err) {
                return this.return(err);
            }

            const { files, folders } = codeContent;
            if (!files || !files.length) {
                return callback();
            }

            const hasIndexHtml = files.findIndex((fName) => fName === constants.INDEX_HTML) !== -1;
            if (!hasIndexHtml) {
                const hasAppFolder = folders.findIndex((fName) => fName === constants.APP) !== -1;
                if (hasAppFolder) {
                    this.path = wDir;
                    return this.checkForAppFolder(constants.CODE, callback);
                }

                return this.checkForCodeDossier(mounts, mountPoint, callback);
            }

            this.content.applications.push(mountPoint);

            callback();
        });
    }
});

$$.swarms.describe('getSSI', {
    getSeedSSI: function (path, dossierName) {
        if (rawDossier) {
            return this._getDSUKeySSI(path, dossierName, this.return);
        }

        this.return(new Error("Raw Dossier is not available."));
    },

    getSReadSSI: function (path, dsuName) {
        if (!rawDossier) {
            return this.return(new Error("Raw Dossier is not available."));
        }

        this._getDSUKeySSI(path, dsuName, (err, keySSI) => {
            if (err) {
                return this.return(err);
            }

            keyssiresolver.loadDSU(keySSI, (err, loadedDSU) => {
                if (err) {
                    return this.return(err);
                }

                loadedDSU.getKeySSIAsString("sread", (err, sReadSSI) => {
                    if (err) {
                        return this.return(err);
                    }

                    this.return(undefined, sReadSSI);
                });
            });
        });
    },

    _getDSUKeySSI: function (path, dsuName, callback) {
        return rawDossier.listMountedDossiers(path, (err, result) => {
            if (err) {
                return callback(err);
            }

            let dsu = result.find((dsr) => dsr.path === dsuName);
            if (!dsu) {
                return callback(`Dossier with the name ${dsuName} was not found in the mounted points!`);
            }

            callback(undefined, dsu.identifier);
        });
    }
});

$$.swarms.describe('marketplaceSwarm', {
    __createMarketplace: function (data, callback) {
        const keyssiSpace = require("opendsu").loadApi("keyssi");
        rawDossier.getKeySSIAsString((err, ssi) => {
            if (err) {
                return this.return(err);
            }
            const templateSSI = keyssiSpace.buildTemplateSeedSSI(keyssiSpace.parse(ssi).getDLDomain());
            keyssiresolver.createDSU(templateSSI, (err, newDossier) => {
                if (err) {
                    this.return(err);
                }

                newDossier.getKeySSIAsString((err, keySSI) => {
                    if (err) {
                        return callback(err);
                    }
                    data.keySSI = keySSI;
                    newDossier.writeFile('/data', JSON.stringify(data), (err, digest) => {
                        if (err) {
                            return callback(err);
                        }

                        rawDossier.readFile(MARKETPLACE_APP_MANIFEST, (err, manifestData) => {
                            if (err) {
                                return callback(err);
                            }

                            try {
                                manifestData = JSON.parse(manifestData.toString());
                            } catch (e) {
                                console.error("[Manifest data parse error]", manifestData);
                                return callback(e);
                            }

                            let codeTemplateSSI = manifestData.mounts && manifestData.mounts["/code"];
                            if (!codeTemplateSSI) {
                                return callback(new Error("Template SSI not found for Marketplace SSApp!"), manifestData);
                            }

                            codeTemplateSSI = codeTemplateSSI.replace(/\s/g, "");
                            newDossier.mount(CODE_FOLDER, codeTemplateSSI, (err) => {
                                if (err) {
                                    return callback(err);
                                }
                                callback(err, keySSI);
                            });
                        });
                    });
                });
            });
        });
    },

    createMarketplace: function (data) {
        this.__createMarketplace(data, (err, keySSI) => {
            if (err) {
                return this.return(err);
            }
            this.mountDossier(rawDossier, MARKETPLACES_MOUNTING_PATH, data.name, keySSI);
        })
    },

    importMarketplace: function (keySSI, name) {
        if(!name || !name.length) {
            const PskCrypto = require("pskcrypto");
            name = PskCrypto.pskHash(keySSI, "hex");
        }

        this.mountDossier(rawDossier, MARKETPLACES_MOUNTING_PATH, name, keySSI);
    },

    listMarketplaces: function () {
        this.__listMarketplaces(MARKETPLACES_MOUNTING_PATH, (err, data) => {
            if (err) {
                return this.return(err);
            }
            this.return(err, data);
        });
    },

    __listMarketplaces: function (PATH, callback) {
        if (!rawDossier) {
            this.return(new Error("Raw Dossier is not available."));
        }
        rawDossier.readDir(PATH, (err, marketplaces) => {
            if (err) {
                return callback(err);
            }
            let toBeReturned = [];
            let getMarketplaceData = (marketplacesList) => {
                if (!marketplaces.length) {
                    return callback(undefined, toBeReturned);
                }

                const marketplace = marketplacesList.shift();
                if (!marketplace.path) {
                    return getMarketplaceData(marketplacesList);
                }

                let appPath = PATH + '/' + marketplace.path;
                rawDossier.readFile(appPath + '/data', (err, fileContent) => {
                    if (err) {
                        return callback(err);
                    }

                    toBeReturned.push({
                        ...JSON.parse(fileContent),
                        path: appPath,
                        identifier: marketplace.identifier
                    });

                    getMarketplaceData(marketplacesList);
                });
            };

            getMarketplaceData(marketplaces);
        });
    },

    removeMarketplace: function (marketplaceData) {
        rawDossier.unmount(marketplaceData.path, (err, data) => {
            if (err) {
                return this.return(err);
            }
            return this.return(err, data);
        });
    },

    mountDossier: function (parentDossier, mountingPath, dsuName, keySSI) {
        let path = `${mountingPath}/${dsuName}`;
        parentDossier.mount(path, keySSI, (err) => {
            if (err) {
                return this.return(err);
            }
            this.return(undefined, {path: path, seed: keySSI});
        });
    }
});

$$.swarms.describe("attachDossier", {
    start: function (path, dossierName, keySSI) {
        if (!rawDossier) {
            this.return(new Error("Raw Dossier is not available."))
        }

        if (!keySSI) {
            return this.createNewDSU((err, newDSUKeySSI) => {
                if (err) {
                    return this.return(err);
                }

                this.mountDossier(path, newDSUKeySSI, dossierName);
            });
        }

        this.mountDossier(path, keySSI, dossierName);
    },
    createNewDSU: function (callback) {
        rawDossier.getKeySSIAsString((err, ssi) => {
            if (err) {
                return callback(err);
            }
            keyssiresolver.createDSU(ssi, (err, newDossier) => {
                if (err) {
                    return callback(err);
                }
                newDossier.getKeySSIAsString((err, keySSI) => {
                    if (err) {
                        return callback(err);
                    }

                    callback(undefined, keySSI);
                });
            });
        });
    },
    mountDossier: function (path, keySSI, dossierName) {
        commons.getParentDossier(rawDossier, path, (err, parentKeySSI, relativePath) => {
            if (err) {
                return this.return(err);
            }

            let mountDossierIn = (parentDossier) => {

                let mountPoint = `${path.replace(relativePath, '')}/${dossierName}`;
                if (!mountPoint.startsWith("/")) {
                    mountPoint = "/" + mountPoint;
                }
                parentDossier.mount(mountPoint, keySSI, (err) => {
                    if (err) {
                        return this.return(err)
                    }
                    this.return(undefined, keySSI);
                });
            };

            //make sure if is the case to work with the current rawDossier instance
            rawDossier.getKeySSIAsString((err, keySSI) => {
                if (err) {
                    return this.return(err);
                }

                if (parentKeySSI !== keySSI) {
                    return keyssiresolver.loadDSU(parentKeySSI, (err, parentRawDossier) => {
                        if (err) {
                            return this.return(err);
                        }
                        mountDossierIn(parentRawDossier);
                    });
                }
                mountDossierIn(rawDossier);
            });
        });
    }
});