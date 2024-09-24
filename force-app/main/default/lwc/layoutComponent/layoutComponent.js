import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import logo from '@salesforce/resourceUrl/clickScan';

export default class LayoutComponent extends NavigationMixin(LightningElement) {
    logoUrl = logo;
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