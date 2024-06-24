import BaseController from './BaseController';
import AppComponent from '../Component';

import Event from 'sap/ui/base/Event';

import JSONModel from 'sap/ui/model/json/JSONModel';
import ImageEditor from 'sap/suite/ui/commons/imageeditor/ImageEditor';

import FileUploader from 'sap/ui/unified/FileUploader';
import MessageToast from 'sap/m/MessageToast';
import * as SuiteLibrary from 'sap/suite/ui/commons/library';
import ResourceBundle from 'sap/base/i18n/ResourceBundle';

type uploadCompleteEvent = {
    fileName: string;
    response: string;
    readyStateXHR: string;
    status: string;
    responseRaw: string;
    headers: unknown;
    requestHeaders: Array<unknown>;
};

/**
 * @namespace ui5.ts.profile.picture.editor
 */
export default class MainController extends BaseController {
    private UIState: JSONModel;
    private ResourceBundle: ResourceBundle;

    public onInit(): void {
        // apply content density mode to root view
        this.getView().addStyleClass((this.getOwnerComponent() as AppComponent).getContentDensityClass());

        // create UI state ref
        this.UIState = this.getUIState() as JSONModel;

        // create i18n ref
        this.ResourceBundle = this.getResourceBundle();
    }

    private async handleEnhancement(oEvent: Event): Promise<void> {
        const oView = this.getView();
        const oController = oView.getController() as BaseController;
        const oFileUploader = oView.byId('fileUploader') as FileUploader;

        // if there is no file selected display a error message
        if (!oFileUploader.getValue()) {
            MessageToast.show(this.ResourceBundle.getText('main.noFileSelectedErrorMessage'));
            return;
        }

        // dunno what you wanted to achieve here? i guess using the param value in the backend for something?
        // const param = oView.byId('uploadParam') as FileUploaderParameter;
        // param.setValue(oInput.getActivePage());
        // oFileUploader.getParameters();

        // croping the image
        const oImageEditor = this.getView().byId('imageEditor') as ImageEditor;
        oImageEditor.applyVisibleCrop(true);

        // set the edited image as input for fileUplaoder
        const oNewBlob = (await oImageEditor.getImageAsBlob()) as Blob;
        await oFileUploader.getProcessedBlobsFromArray([oNewBlob]);

        // block ui while uploading picture to API for enhancement
        await oController.startBusy();
        oFileUploader.upload(true);
    }

    private handleSaveAs(oEvent: Event): void {
        const oView = this.getView();
        const oController = oView.getController() as BaseController;
        const oImageEditor = oView.byId('imageEditor') as ImageEditor;

        // open the browsers save as dialog and redirect to SAP Community profile site in a new tab
        oImageEditor.openSaveDialog();
        oController.openUrl('https://people.sap.com/', true);
    }

    private onFileChange(oEvent: Event): void {
        const oFile = (oEvent.getParameter('files') as Array<File>)[0];
        const oImageEditor = this.getView().byId('imageEditor') as ImageEditor;

        // if there is no file selected return w/o doing anything
        if (!oFile) {
            return;
        }

        // block UI while loading image
        this.UIState.setProperty('/app/busy', true);
        oImageEditor.setSrc(oFile);
    }

    private onImageLoaded(oEvent: Event): void {
        const oView = this.getView();
        const oImageEditor = oView.byId('imageEditor') as ImageEditor;

        // do some preconfigs inside the image editor
        oImageEditor.zoomToFit();
        oImageEditor.setCropAreaByRatio(1, 1);
        oImageEditor.setMode(SuiteLibrary.ImageEditorMode.CropEllipse);

        // release UI because image is loaded
        this.UIState.setProperty('/app/busy', false);
    }

    private async onUploadStart(oEvent: Event): Promise<void> {
        const oView = this.getView();
        const oController = oView.getController() as BaseController;

        // block the ui while uploading the image to the API
        await oController.startBusy();
    }

    private onUploadComplete(oEvent: Event): void {
        const oView = this.getView();
        const oController = oView.getController() as BaseController;
        const oImageEditor = oView.byId('imageEditor') as ImageEditor;

        // get the raw response from API
        const sResponseRaw = (oEvent.getParameters() as uploadCompleteEvent).responseRaw;
        const sDataURL = `data:image/png;base64,${sResponseRaw}`;

        // set source for image editor to API response
        oImageEditor.setSrc(sDataURL);
        oController.endBusy(oController);
    }
}
