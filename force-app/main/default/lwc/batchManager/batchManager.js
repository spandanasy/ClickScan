import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createBatchApex from '@salesforce/apex/StorageandbatchController.createBatch';
import uploadFileApex from '@salesforce/apex/StorageandbatchController.uploadFileToBatch';
import getBatchList from '@salesforce/apex/StorageandbatchController.getBatchList';
import deleteBatches from '@salesforce/apex/StorageandbatchController.deleteBatches';

export default class ClickScanBatch extends LightningElement {

    @track directoryName = '';
    @track files = [];
    @track Batches = [];
    @track isModalOpen = false;
    @track activeTab = 'create';

    handleView(event) {
        const id = event.currentTarget.dataset.id;
        this.showToast('Info', `View storage ${id}`, 'info');
    }

    handleEdit(event) {
        const id = event.currentTarget.dataset.id;
        this.showToast('Info', `Edit storage ${id}`, 'info');
    }

    handleDelete(event) {
        const id = event.currentTarget.dataset.id;
        this.showToast('Info', `Delete storage ${id}`, 'info');
    }
    @api handleBatchOpenModal() {
        this.isModalOpen = true;
        this.activeTab = 'create';
    }

    handleBatchCloseModal() {
        this.isModalOpen = false;
    }

    get isCreateTab() {
        return this.activeTab === 'create';
    }
    get isListTab() {
        return this.activeTab === 'list';
    }

    handleTabChange(event) {
        this.activeTab = event.target.value;
        if (this.activeTab === 'list') {
            this.fetchBatchList();
        }
    }

    fetchBatchList() {
        getBatchList()
            .then(result => {
                this.Batches = result.map(item => ({
                    id: item.id,
                    name: item.name,
                    created_at: item.created_at,
                    countFile: item.countFile
                }));
            })
            .catch(error => {
                this.showToast('Error', 'Failed to fetch batch list', 'error');
            });
    }

    handleClear() {
        this.directoryName = '';
        this.files = [];
    }

    handleDelete(event) {
        const id = event.currentTarget.dataset.id;
        deleteBatches({ ids: [parseInt(id, 10)] })
            .then(result => {
                if(result === 'success') {
                    this.showToast('Success', 'Batch deleted successfully', 'success');
                    this.fetchBatchList();
                } else {
                    this.showToast('Error', result, 'error');
                }
            })
            .catch(error => {
                this.showToast('Error', error.body ? error.body.message : error.message, 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    // Create + Upload Files to Batch

    @track batchName;
    @track selectedFiles = [];
    @track fileCountLabel = '';

    handleNameChange(event) {
        this.batchName = event.target.value;
    }

    handleFileSelection(event) {
        this.selectedFiles = Array.from(event.target.files);
        this.fileCountLabel = this.selectedFiles.length > 0
            ? `Selected ${this.selectedFiles.length} file(s)`
            : '';
    }

    async handleCreateAndUpload() {
        if (!this.batchName) {
            this.showToast('Error', 'Please enter a batch name', 'error');
            return;
        }
        if (this.selectedFiles.length === 0) {
            this.showToast('Error', 'Please select at least one file', 'error');
            return;
        }

        try {
            // 1. Create Batch
            const createRes = await createBatchApex({ name: this.batchName });
            const batchRes = JSON.parse(createRes);

            if (batchRes.statusCode === 200 && batchRes.payload.length > 0) {
                const batchId = batchRes.payload[0].id;

                // 2. Upload each file via Apex
                for (let file of this.selectedFiles) {
                    const base64 = await this.readFileAsBase64(file);
                    const response = await uploadFileApex({
                        base64File: base64,
                        fileName: file.name,
                        contentType: file.type,
                        batchId: batchId
                    });
                    console.log('Upload response for', file.name, response);
                    await new Promise(r => setTimeout(r, 500));
                }

                // this.showToast('Success', Uploaded ${this.selectedFiles.length} file(s) to Batch ${batchId}, 'success');
                this.showToast('Success', `Created Batch ${batchId} & Uploaded ${this.selectedFiles.length} file(s) to Batch ${batchId}`, 'success');
                
                this.batchName = '';
                this.selectedFiles = [];
                this.fileCountLabel = '';
                this.template.querySelector('lightning-input[type="file"]').value = null;

            } else {
                this.showToast('Error', 'Batch creation failed', 'error');
            }
        } catch (error) {
            // console.error(error);
            // this.showToast('Error', 'Process failed', 'error');
        }
    }

    readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                let base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

}