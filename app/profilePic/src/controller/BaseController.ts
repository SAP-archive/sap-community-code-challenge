import Controller from 'sap/ui/core/mvc/Controller';

import UIComponent from 'sap/ui/core/UIComponent';
import Router from 'sap/ui/core/routing/Router';
import Model from 'sap/ui/model/Model';
import ResourceModel from 'sap/ui/model/resource/ResourceModel';
import ResourceBundle from 'sap/base/i18n/ResourceBundle';
import History from 'sap/ui/core/routing/History';
import { URLHelper } from 'sap/m/library';
import Fragment from 'sap/ui/core/Fragment';
import syncStyleClass from 'sap/ui/core/syncStyleClass';
import BusyDialog from 'sap/m/BusyDialog';

/**
 * @namespace ui5.ts.profile.picture.editor.controller
 */
export default class BaseController extends Controller {
    public oBusyDialog: BusyDialog;

    /**
     * Convenience method for accessing the router in every controller of the application.
     * @public
     * @returns {sap.ui.core.routing.Router} the router for this component
     */
    public getRouter(): Router {
        return (this.getOwnerComponent() as UIComponent).getRouter();
    }

    /**
     * Convenience method for getting the view model by name in every controller of the application.
     * @public
     * @param {string} sName the model name
     * @returns {sap.ui.model.Model} the model instance
     */
    public getModel(name?: string): Model {
        return this.getView().getModel(name);
    }

    /**
     * Convenience method for getting the UI state in every controller of the application.
     * @public
     * @returns {sap.ui.model.Model} the model instance
     */
    public getUIState(): Model {
        return this.getOwnerComponent().getModel('UIState');
    }

    /**
     * Convenience method for setting the view model in every controller of the application.
     * @public
     * @param {sap.ui.model.Model} oModel the model instance
     * @param {string} sName the model name
     */
    public setModel(model: Model, name?: string): void {
        this.getView().setModel(model, name);
    }

    /**
     * Convenience method for getting the resource bundle.
     * @public
     * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
     */
    public getResourceBundle(): ResourceBundle {
        return (
            (this.getOwnerComponent() as UIComponent).getModel('i18n') as ResourceModel
        ).getResourceBundle() as ResourceBundle;
    }

    /**
     * Convenience method for redirecting to a URL.
     * @public
     */
    public openUrl(url: string, newTab: boolean): void {
        // Require the URLHelper and open the URL in a new window or tab (same as _blank):
        URLHelper.redirect(url, newTab);
    }

    /**
     * Convenience method for opening a sap.m.BusyDialog.
     * @public
     */
    public async startBusy(): Promise<void> {
        if (!this.oBusyDialog) {
            this.oBusyDialog = (await Fragment.load({
                name: 'ui5.ts.profile.picture.editor.view.fragments.BusyDialog',
                controller: this
            })) as BusyDialog;

            this.getView().addDependent(this.oBusyDialog);
            syncStyleClass('sapUiSizeCompact', this.getView(), this.oBusyDialog);
        }

        this.oBusyDialog.open();
    }

    /**
     * Convenience method for closing a sap.m.BusyDialog.
     * @public
     */
    public endBusy(oController: BaseController): void {
        if (oController.oBusyDialog) {
            oController.oBusyDialog.close();
        }
    }

    /**
     * Event handler for navigating back.
     * It there is a history entry we go one step back in the browser history
     * If not, it will replace the current entry of the browser history with the master route.
     * @public
     */
    public onNavBack(): void {
        const sPreviousHash = History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
            // eslint-disable-next-line
            history.go(-1);
        } else {
            this.getRouter().navTo('main', {}, {}, true);
        }
    }
}
