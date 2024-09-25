import { LightningElement, wire } from 'lwc';
import logo from '@salesforce/resourceUrl/click_scan';
import getDatabaseDetails from '@salesforce/apex/DatabaseController.getDatabaseDetails';

export default class DatabaseDetails extends LightningElement {
    databases;
    numberOfUsers;
    error;
    logoUrl = logo;

    // Fetch database details
    @wire(getDatabaseDetails)
    wiredDatabases({ error, data }) {
        if (data) {
            const parsedData = JSON.parse(data);
            this.databases = parsedData.payload.data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.databases = undefined;

            // Log the error to the console
            console.error('Error fetching database details:', error);
        }
    }

    navigateToDashboard() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/lightning/page/home' // Using relative path for better maintainability
            }
        });  
    }
}
