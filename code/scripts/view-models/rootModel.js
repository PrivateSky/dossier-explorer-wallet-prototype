const basePagesPath = "http://localhost:8000/pages/";

const pageLoader = {
  walletGridContent: `${basePagesPath}Wallet/wallet-content-grid.html`,
  walletListContent: `${basePagesPath}Wallet/wallet-content-list.html`,
  addDossierMenu: `${basePagesPath}Wallet/add-dossier-menu.html`,
  rightIconsMenu: `${basePagesPath}Wallet/right-icons-menu.html`,
  switchLayout: `${basePagesPath}Wallet/switch-layout.html`,
};

const rootModel = {
  pageLoader: {
    ...pageLoader
  },
  content: [],
  pageTitle: "E-Wallet",
  sectionTitle: "Dashboard",
  isGridLayout: true,
  signOutLabel: "Exit",
  currentPath: '/',
  dossierContentLabels: {
    homeLabel: "My Wallet",
    sizeLabel: "Size",
    typeLabel: "Type",
    lastModifiedLabel: "Last modification",
    nameLabel: "Name",
    runAppLabel: "Run",
    noItemsLabel: "There are no items in the current folder/dossier. You can add some by using the Add button.",
  },
  addMenuLabels: {
    addLabel: "Add",
    addFileLabel: "Add file",
    addFolderLabel: "Add folder",
    createDossierLabel: "Create Dossier",
    importDossierLabel: "Import Dossier",
    receiveDossierLabel: "Receive Dossier",
  },
  hoverLabels: {
    switchGridHover: "Click to switch to list",
    switchListHover: "Click to switch to grid",
  },
  iconsMenuMoreOptions: [{
      label: "Move",
      eventName: 'move-dossier'
    },
    {
      label: "Rename",
      eventName: 'rename-dossier'
    }
  ]
};

export default rootModel;