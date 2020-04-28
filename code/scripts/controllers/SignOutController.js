import ModalController from "../../cardinal/controllers/base-controllers/ModalController.js";

export default class SignOutController extends ModalController {
  constructor(element) {
    super(element);
    this._initListeners();
  }

  _initListeners = () => {
    this.on("sign-out-confirm", this.element, this._confirmExitHandler, true);

    this.model.onChange(
      "checkboxDeleteSeed.value",
      this._checkboxDeleteSeedToggle
    );
  };

  _checkboxDeleteSeedToggle = () => {
    let isCheckboxChecked =
      this.model.getChainValue("checkboxDeleteSeed.value") === "checked";
    this.model.setChainValue("confirmBtn.disabled", !isCheckboxChecked);
  };

  _confirmExitHandler = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    let deleteSeed = event.data === 'delete-seed';
    this.responseCallback(undefined, {
      deleteSeed: deleteSeed
    });
  };
}