import BaseController from './BaseController';
import AppComponent from '../Component';

import JSONModel from 'sap/ui/model/json/JSONModel';

/**
 * @namespace ui5.ts.profile.picture.editor.controller
 */
export default class AppController extends BaseController {
    private UIState: JSONModel;

    public onInit(): void {
        // apply content density mode to root view
        this.getView().addStyleClass((this.getOwnerComponent() as AppComponent).getContentDensityClass());

        // create UI state model ref
        this.UIState = this.getUIState() as JSONModel;
    }
}
