import { LightningElement, track, api } from 'lwc';
import getStorageList from '@salesforce/apex/StorageandbatchController.getStorageList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deleteStorages from '@salesforce/apex/StorageandbatchController.deleteStorages';
import createDirectoryApex from '@salesforce/apex/StorageandbatchController.createDirectory';
import uploadFileToDirectoryApex from '@salesforce/apex/StorageandbatchController.uploadFileToDirectory';

export default class ClickScanStorage extends LightningElement {
    @track directoryName = '';
    @track files = [];
    @track storages = [];
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

    @api handleStorageOpenModal() {
        this.isModalOpen = true;
        this.activeTab = 'create';
    }
    
    handleStorageCloseModal() {
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
            this.fetchStorageList(); 
        }
    }

    fetchStorageList() {
        getStorageList()
            .then(result => {
                this.storages = result.map(item => ({
                    id: item.id,
                    name: item.name,
                    created_at: item.created_at,
                    countFile: item.countFile
                }));
            })
            .catch(error => {
                this.showToast('Error', 'Failed to fetch storage list', 'error');
            });
    }

    handleFileChange(event) {
        this.files = event.target.files.length > 0 ? Array.from(event.target.files) : [];
    }

    handleClear() {
        this.directoryName = '';
        this.files = [];
    }

    handleDelete(event) {
        const id = event.currentTarget.dataset.id;
        deleteStorages({ ids: [parseInt(id, 10)] })
            .then(result => {
                if(result === 'success') {
                    this.showToast('Success', 'Storage deleted successfully', 'success');
                    this.fetchStorageList();
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

    // Create + Upload Files to Storage
    
    @track directoryName;
    @track selectedFiles = [];
    @track fileCountLabel = '';

    handleNameChange(event) {
        this.directoryName = event.target.value;
    }

    handleFileSelection(event) {
        this.selectedFiles = Array.from(event.target.files);
        this.fileCountLabel = this.selectedFiles.length > 0
            ? `Selected ${this.selectedFiles.length} file(s)`
            : '';
    }

    async handleCreateAndUpload() {
        if (!this.directoryName) {
            this.showToast('Error', 'Please enter a Storage name', 'error');
            return;
        }
        if (this.selectedFiles.length === 0) {
            this.showToast('Error', 'Please select at least one file', 'error');
            return;
        }

        try {
            // 1. Create Directory
            const createRes = await createDirectoryApex({ name: this.directoryName });
            const dirRes = JSON.parse(createRes);

            if (dirRes.statusCode === 200 && dirRes.payload.length > 0) {
                const directoryId = dirRes.payload[0].id;

                // 2. Upload files
                for (let file of this.selectedFiles) {
                    const base64 = await this.readFileAsBase64(file);
                    const response =await uploadFileToDirectoryApex({
                        base64File: base64,
                        fileName: file.name,
                        contentType: file.type,
                        directoryId: directoryId
                    });
                    console.log('Upload response for', file.name, response);
                    await new Promise(r => setTimeout(r, 300));
                }

                this.showToast('Success', `Created Storage ${directoryId} & Uploaded ${this.selectedFiles.length} file(s)`, 'success');
                
                // Reset
                this.directoryName = '';
                this.selectedFiles = [];
                this.fileCountLabel = '';
                this.template.querySelector('lightning-input[type="file"]').value = null;

            } else {
                this.showToast('Error', 'Storage creation failed', 'error');
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