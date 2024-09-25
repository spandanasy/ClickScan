import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import logo from '@salesforce/resourceUrl/click_scan';
import getOrgAndUserInfo from '@salesforce/apex/OrganizationUserController.getOrgAndUserInfo';
import getDashboardData from '@salesforce/apex/DrawerController.getDashboardData';  // Import the method

export default class DashboardComponent extends NavigationMixin(LightningElement) {

    orgName;
    orgId;
    userName;
    allUserNames = [];
    drawerCount;
    folderCount;  // Presumably to be fetched from another API, since it's not handled in the current setup
    userCount;    // Same as above
    logoUrl = logo;

    // Fetch organization and user information
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

    @wire(getDashboardData)
    wiredDashboardData({ error, data }) {
        if (data) {
            this.drawerCount = data.drawerCount;  // Assign the drawer count to the component property
            this.folderCount = data.folderCount;  // Assign the folder count
            this.userCount = data.userCount;      // Assign the user count
        } else if (error) {
            console.error('Error fetching dashboard data', error);
        }
    }

    // Compute the card title based on fetched org and user info
    get cardTitle() {
        return `Org Name: ${this.orgName} | Org ID: ${this.orgId} | User Name: ${this.userName}`;
    }

    // Placeholder methods for handling UI actions
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

    // Navigation methods to redirect to different pages
    navigateToDashboard() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/lightning/page/home' // Using relative path for better maintainability
            }
        });  
    }

    navigateToDrawerManagement() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/lightning/n/Drawer_Management' // Using relative path for better maintainability
            }
        });  
    }

    navigateToUserManagement() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/lightning/n/User_Management' // Using relative path for better maintainability
            }
        });
    }

    navigateToDatabaseSettings() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/lightning/n/Database_setting' // Using relative path for better maintainability
            }
        });
    }

    renderedCallback() {
        const navLinks = this.template.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Remove 'active' class from all links
                navLinks.forEach(nav => nav.classList.remove('active'));

                // Add 'active' class to the clicked link
                this.classList.add('active');
            });
        });
    }
}
