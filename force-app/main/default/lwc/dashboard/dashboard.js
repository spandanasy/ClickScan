import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import logo from '@salesforce/resourceUrl/clickScan';
import getOrgAndUserInfo from '@salesforce/apex/OrganizationUserController.getOrgAndUserInfo';

export default class DashboardComponent extends NavigationMixin(LightningElement) {
 
    orgName;
    orgId;
    userName;
    allUserNames = [];
    drawerCount = 16;
    folderCount = 92;
    userCount = 22;
    logoUrl = logo;

    @wire(getOrgAndUserInfo)
    wiredOrgAndUserInfo(result) {
        if (result.data) {
            this.orgName = result.data.orgName;
            this.orgId = result.data.orgId;
            this.userName = result.data.userName;
            this.allUserNames = result.data.allUserNames; 
        } else if (result.error) {
            console.error('Error retrieving organization and user info', result.error);
        }
    }

    get cardTitle() {
        return `${this.orgName} Org ID: ${this.orgId} User Name: ${this.userName}`;
    }

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

    navigateToDrawerManagement() 
    {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: 'https://terralogic3-dev-ed.develop.lightning.force.com/lightning/n/Drawer_Management' // Ensure this matches the component's name
            }
        });  
    }
    navigateToUserManagement() 
    {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: 'https://terralogic3-dev-ed.develop.lightning.force.com/lightning/n/User_Management' // Ensure this matches the component's name
            }
        });
    }
}
