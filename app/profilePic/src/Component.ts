import UIComponent from 'sap/ui/core/UIComponent';

import JSONModel from 'sap/ui/model/json/JSONModel';
import { support } from 'sap/ui/Device';
import models from './models/models';

/**
 * @namespace ui5.ts.profile.picture.editor
 */
export default class Component extends UIComponent {
    private UIState: JSONModel;
    private contentDensityClass: string;

    public static metadata = {
        manifest: 'json'
    };

    public init(): void {
        // call the base component's init function
        super.init();

        // set the device model
        this.setModel(models.createDeviceModel(), 'device');

        // create and bind view state model
        this.UIState = new JSONModel({
            app: {
                busy: false,
                busyDelay: 0
            },
            main: {}
        });
        this.setModel(this.UIState, 'UIState');

        // create the views based on the url/hash
        this.getRouter().initialize();
    }

    public destroy(): void {
        super.destroy();
    }

    /**
     * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
     * design mode class should be set, which influences the size appearance of some controls.
     *
     * @public
     * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
     */
    public getContentDensityClass(): string {
        if (this.contentDensityClass === undefined) {
            // check whether FLP has already set the content density class; do nothing in this case
            if (
                document.body.classList.contains('sapUiSizeCozy') ||
                document.body.classList.contains('sapUiSizeCompact')
            ) {
                this.contentDensityClass = '';
            } else if (!support.touch) {
                // apply "compact" mode if touch is not supported
                this.contentDensityClass = 'sapUiSizeCompact';
            } else {
                // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
                this.contentDensityClass = 'sapUiSizeCozy';
            }
        }
        return this.contentDensityClass;
    }
}
