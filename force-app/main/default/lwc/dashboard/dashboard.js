import { LightningElement, wire } from 'lwc';
import logo from '@salesforce/resourceUrl/clickScan';
import getOrgAndUserInfo from '@salesforce/apex/OrganizationUserController.getOrgAndUserInfo';

export default class DashboardComponent extends LightningElement {
    orgName;
    orgId;
    userName;
    allUserNames = [];

    @wire(getOrgAndUserInfo)
    wiredOrgAndUserInfo({ error, data }) {
        if (data) {
            this.orgName = data.orgName;
            this.orgId = data.orgId;
            this.userName = data.userName;
            this.allUserNames = data.allUserNames; 
        } else if (error) {
            console.error('Error retrieving organization and user info', error);
        }
    }

    get cardTitle() {
        return `${this.orgName} Org ID: ${this.orgId} User Name: ${this.userName}`;
    }

    drawerCount = 16;
    folderCount = 92;
    userCount = 22;
    logoUrl = logo;

    handleCreateDrawer() {
        // Logic to create a new drawer
    }

    handleCreateUser() {
        // Logic to create a new user
    }

    handleImportFolder() {
        // Logic to import a folder
    }

    handleGenerateReport() {
        // Logic to generate an audit report
    }
}
