
export interface OnDialogDismiss {

    /**
     * Intercept onDismiss event
     * and return a proper result.
     * Use this to intercept the dismiss event triggered
     * when use clicks close or backdrop.
     */
    onDialogDismiss(): any;

}