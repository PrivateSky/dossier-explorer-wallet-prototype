export const signOutModel = {
  opened: false,
  title: "Exit Wallet",
  confirmDeleteSeedDisclaimer:
    "Would you also like to delete Walled SEED from this device?",
  hasError: 0,
  errorMessage: "Service error",
  deleteSeedAgreement: {
    checked: false,
    checkboxLabel: "I have a copy of this Wallet SEED",
    value: "unchecked",
  },
  confirmBtn: {
    disabled: true,
    label: "Yes",
    eventName: "sign-out-confirm",
    buttonClass: "btn-confirm",
  },
  exitBtn: {
    label: "No, just exit",
    eventName: "sign-out-confirm",
    buttonClass: "btn-confirm-primary",
  },
};
