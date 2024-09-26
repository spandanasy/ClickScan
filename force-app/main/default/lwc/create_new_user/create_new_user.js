import { LightningElement, track} from 'lwc';
import logo from '@salesforce/resourceUrl/click_scan';
import createDrawer from '@salesforce/apex/CreateNewDrawerController.createDrawer';
export default class DrawerManagement extends LightningElement {

    logoUrl = logo;

    isModalOpen = false;

    // Show confirmation popup
    showConfirmationPopup() {
        this.isModalOpen = true;
    }

    // Close the modal without any action
    closePageModal() {
        this.isModalOpen = false;
    }

    // Handle go back action
    handleGoBack() {
        this.isModalOpen = false;
        window.history.back(); // Navigate to the previous page
    }

    handleMenuItemClick(event) {
        const selectedOption = event.detail.value;
        // Add your logic based on the selected option
        console.log('Selected Option:', selectedOption);
    }
    @track isErrorModalVisible = false; // Initialize variable
    @track errorMessage = '';
    @track username = ''
    @track description = ''
    @track fieldName = '';
    @track fieldType = 'Text';
    @track fieldWidth = 0;
    @track fieldFormat = 'Text';
    @track required = false;
    @track uniqueKey = false;
    @track keyReference = false;
    @track autoIndex = false;
    @track dataStamp = false;
    @track dataReference = false;
    @track fields = [];
    @track isEditMode = false;
    @track editFieldId = null;

    fieldTypeOptions = [
        { label: 'Text', value: 'Text' },
        { label: 'Number', value: 'Number' },
        { label: 'Date', value: 'Date' },
        { label: 'Phone Number', value: 'Phone Number' }
    ];

    fieldFormatOptions = [
        { label: 'Text', value: 'Text' },
        { label: 'Number', value: 'Number' },
        { label: 'Date', value: 'Date' },
        { label: 'Phone Number', value: 'Phone Number' }
    ];

    handleusernameChange(event) {
        this.username = event.target.value;
    }

    handledescriptionChange(event) {
        this.description = event.target.value;
    }

    handleFieldNameChange(event) {
        this.fieldName = event.target.value;
    }

    handleFieldTypeChange(event) {
        this.fieldType = event.target.value;
    }

    handleFieldWidthChange(event) {
        this.fieldWidth = event.target.value;
    }

    handleFieldFormatChange(event) {
        this.fieldFormat = event.target.value;
    }

    handleRequiredChange(event) {
        this.required = event.target.checked;
    }

    handleUniqueKeyChange(event) {
        this.uniqueKey = event.target.checked;
    }    

    handleKeyReferenceChange(event) {
        this.keyReference = event.target.checked;
    }

    handleAutoIndexChange(event) {
        this.autoIndex = event.target.checked;
    }

    handleDataStampChange(event) {
        this.dataStamp = event.target.checked;
    }

    handleDataReferenceChange(event) {
        this.dataReference = event.target.checked;
    }

    @track isButtonDisabled = true; // Initially, the button is disabled
    handleFieldNameChange(event) {
        this.fieldName = event.target.value;

        // Enable the button if fieldName is enterd, otherwise disable it
        this.isButtonDisabled = this.fieldName === '';
    }
    handleusernameChange(event) {
        this.username = event.target.value;

        // Enable the button if username is enterd, otherwise disable it
        this.isButtonDisabled = this.username === '';
    }

    navigateToDashboard() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/lightning/page/home' // Using relative path for better maintainability
            }
        });  
    }

    handleInsert() {
        if (this.isEditMode) {
            this.fields = this.fields.map(field => {
                if (field.id === this.editFieldId) {
                    return {
                        ...field,
                        name: this.fieldName,
                        type: this.fieldType,
                        width: this.fieldWidth,
                        required: this.required ? 'Yes' : 'No',
                        unique: this.uniqueKey ? 'Yes' : 'No'
                    };
                }
                return field;
            });
            this.isEditMode = false;
            this.editFieldId = null;
        } else {
            const newField = {
                id: this.fields.length + 1,
                name: this.fieldName,
                type: this.fieldType,
                width: this.fieldWidth,
                required: this.required ? 'Yes' : 'No',
                unique: this.uniqueKey ? 'Yes' : 'No'
            };
            this.fields = [...this.fields, newField];
        }
            console.log('name', this.username);
            console.log('description', this.description);
            console.log('fieldName', this.fieldName);
            console.log('fieldWidth', this.fieldWidth);
            console.log('required', this.required);
            console.log('uniqkey', this.uniqueKey);

        // Reset form
        this.fieldName = '';
        this.fieldType = 'Text';
        this.fieldWidth = 0;
        this.fieldFormat = 'Text';
        this.required = false;
        this.uniqueKey = false;
        this.keyReference = false;
        this.autoIndex = false;
        this.dataStamp = false;
        this.dataReference = false;
    }

    handleEdit(event) {
        const fieldId = event.target.dataset.id;
        const field = this.fields.find(field => field.id === parseInt(fieldId, 10));

        this.fieldName = field.name;
        this.fieldType = field.type;
        this.fieldWidth = field.width;
        this.required = field.required === 'Yes';
        this.uniqueKey = field.unique === 'Yes';
        this.isEditMode = true;
        this.editFieldId = field.id;
    }

    handleDelete(event) {
        const fieldId = event.target.dataset.id;
        this.fields = this.fields.filter(field => field.id !== parseInt(fieldId, 10));
    }
    // balaji worked coe
    handleSaveClick() {
        createDrawer({ 
            username: this.username, 
            description: this.description, 
            fieldName: this.fieldName, 
            fieldWidth: this.fieldWidth, 
            fieldFormat: this.fieldFormat 
        })
        .then(result => {
            // Assuming 'result' is a JSON response string from Apex, you may need to parse it
            const response = JSON.parse(result);
            console.log("fddfdf",response);
            // If the response contains a statusCode
            if (response.statusCode >= 200 && response.statusCode < 300) {
                // Success: show success modal
                this.isSuccessModalVisible = true;
                this.successMessage = 'Drawer created successfully!';
            } else {
                // Error: show error modal with the error message from the server
                this.isErrorModalVisible = true;
                this.errorMessage = `Error (Code: ${response.statusCode}): ${response.message || 'An unexpected error occurred.'}`;
            }
        })
        .catch(error => {
            // Handle client-side errors or server errors that don't return a proper response
            this.isErrorModalVisible = true;
    
            // Check if error has a response body with a message, otherwise display a generic error
            if (error.body && error.body.message && error.body.statusCode) {
                // Display the status code along with the error message
                this.errorMessage = `Error (Code: ${error.body.statusCode}): ${error.body.message}`;
            } else if (error.body && error.body.message) {
                // If only the message is available without status code
                this.errorMessage = `Error: ${error.body.message}`;
            } else {
                // Fallback for unexpected errors
                this.errorMessage = 'Unexpected error occurred. Please try again.';
            }
    
            console.error('Error creating drawer:', error); // Log the error for debugging purposes
        });
    } 

closeModal() {
    this.isSuccessModalVisible = false;
    this.isErrorModalVisible = false;
}

}