import { LightningElement, track,wire } from 'lwc';
import logo from '@salesforce/resourceUrl/click_scan';
import getDrawers from '@salesforce/apex/getDrawerList.getDrawers';
import removeDrawer from '@salesforce/apex/RemoveDrawerId.removeDrawer';
import createDuplicateDrawer from '@salesforce/apex/DuplicateDrawerController.createDuplicateDrawer';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex'; // Import refreshApex
import { NavigationMixin } from 'lightning/navigation';

const DELAY = 300;
export default class DrawerManagementApp extends NavigationMixin(LightningElement) {
    @track isOpen = false;

    logoUrl = logo;

    //spanda code
    @track drawers = []; // To store the fetched drawer data
    @track error; // To store any errors
    @track users = []; // To store the users data
    @track filteredUsers = []; // To store filtered users (for template iteration)
    @track sortDirection = 'asc'; // Default sort direction for sorting users
    // @track selectedUser =null;
    @track selected_id;
    @track userId;
    @track wiredData;
    @track selectedUser = {
        username: 'N/A',
        description: 'N/A',
        createdDate: 'N/A'
    };
    //duplicate drawer data
    name = ''; // Placeholder for the dynamically fetched name
    description = ''; // Placeholder for the dynamically fetched description
    drawerid1 = ''; // Placeholder for the dynamically fetched drawer ID
    databaseId = '1'; // Default value for databaseId
    //popups
    @track isModalOpen = false;  // Track the state of the modal
    @track isDuplicateModalOpen = false;
    @track isPurgeOpen = false; 
    NavigatetoEdit(){
        console.log("thippeswamy");
        // 
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'spandana'
            }
        });
       
    }
    // Fetch data from Apex controller
    // @wire(getDrawers)
    // wiredDrawers({ error, data }) {
    //     console.log("Fetching drawer data...");
    //     if (data) {
    //         this.drawers = data;
    //         this.users = [...this.drawers]; // Assign drawer data to users
    //         this.filteredUsers = [...this.users]; // Assign users to filteredUsers
    //         if (this.filteredUsers.length > 0){
    //             this.selected_id = this.filteredUsers[0].id;
    //             this.selectedUser = this.filteredUsers[0];
    //              console.log('Drawers data:', JSON.stringify(this.drawers));} // Log the data to the console
    //     } else if (error) {
    //         this.error = error;
    //         console.error('Error fetching drawers:', JSON.stringify(this.error)); // Log errors to the console
    //     };
    // } 
    @wire(getDrawers)
    wiredDrawers(result) {
        this.wiredData = result; // Capture the wired result for refresh
        const { data, error } = result;

        console.log("Fetching drawer data...");
        if (data) {
            this.drawers = data;
            this.users = [...this.drawers]; // Assign drawer data to users
            this.filteredUsers = [...this.users]; // Assign users to filteredUsers

            if (this.filteredUsers.length > 0) {
                this.selected_id = this.filteredUsers[0].id;
                this.selectedUser = this.filteredUsers[0];
                console.log('Drawers data:', JSON.stringify(this.drawers));
            }
        } else if (error) {
            this.error = error;
            console.error('Error fetching drawers:', JSON.stringify(this.error)); // Log errors to the console
        }
    }
    
   
    
    // handleUserClick(event) {
    //     const userId = event.currentTarget.dataset.id;
    //     this.selectedUser = this.users.find(user => user.id === parseInt(userId));
    // }
     // Handle User Click Event //kamalcode//
    
        // console.log('Selected User:', JSON.stringify(this.selectedUser));

    // Sorting Functionality (Optional)
    sortUsersBy(field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        const isAsc = this.sortDirection === 'asc';

        this.filteredUsers.sort((a, b) => {
            const valA = a[field].toLowerCase();
            const valB = b[field].toLowerCase();
            return isAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });
    };
    //worked code dont forget ////////
    // handleUserClick(event) {
        
    //     const userId = event.currentTarget.dataset.id; // This is usually a string
    //     this.selected_id = userId;
    //     console.log("Selected ID:", this.selected_id); // Log selected_id
    //     console.log("User ID:", userId); // Log userId
    
    //     // Make sure that user.id and userId are of the same type
    //     const clickedUser = this.filteredUsers.find(user => user.id === userId || user.id === parseInt(userId, 10)); 
    
    //     if (clickedUser) {
    //         this.selectedUser = clickedUser; // Update the selected user
    //     } else {
    //         this.selectedUser = {
    //             username: 'N/A',
    //             description: 'N/A',
    //             createdDate: 'N/A'
    //         };
    //     }
    
    //     console.log('Selected User:', this.selectedUser);
        
    // }      
    
    handleUserClick(event) {
        // Existing functionality for handling user click
        const userId = event.currentTarget.dataset.id; // This is usually a string
        this.selected_id = userId;
        console.log("Selected ID:", this.selected_id); // Log selected_id
        console.log("User ID:", userId); // Log userId
    
        // Find the clicked user
        const clickedUser = this.filteredUsers.find(user => user.id === userId || user.id === parseInt(userId, 10));
    
        if (clickedUser) {
            this.selectedUser = clickedUser; // Update the selected user
        } else {
            this.selectedUser = {
                username: 'N/A',
                description: 'N/A',
                createdDate: 'N/A'
            };
        }
    
        console.log('Selected User:', this.selectedUser);
    
        const clickedRow = event.currentTarget;
    console.log("clicked_row", clickedRow);

    // Remove the 'selected-row' class from any previously selected row
    const previouslySelectedRow = this.template.querySelector('.selected-row');
    if (previouslySelectedRow && previouslySelectedRow !== clickedRow) {
        previouslySelectedRow.classList.remove('selected-row');
    }

    // Immediately add the 'selected-row' class to the clicked row
    clickedRow.classList.add('selected-row');;
    }

    handleRemove() {
        console.log("remove drawer method is clicked");
        console.log('selected_id',this.selected_id);
        // Ensure that we have a selected user ID
        if (this.selected_id) {
            // Call the Apex method and pass the selected_id
            removeDrawer({ drawerId: this.selected_id })
                .then((result) => {
                    console.log('Drawer removed successfully:', result);
                    // Optionally, you can show a toast message to inform the user
                    this.showToast('Success', result, 'success');
                    return refreshApex(this.wiredData);
                })
                .catch((error) => {
                    console.error('Error removing drawer:', error);
                    this.showToast('Error', 'Failed to remove drawer', 'error');
                });
        } else {
            console.warn('No user ID selected for removal');
        }
        this.isModalOpen = false;
    }

    
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable' // Allows the toast to be dismissed by the user
        });
        this.dispatchEvent(event);
    
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            // Dispatch a second event to dismiss the toast after 3 seconds
            const dismissEvent = new ShowToastEvent({
                title: '',
                message: '',
                variant: '',
                mode: 'dismissable' // Dismiss the toast
            });
            this.dispatchEvent(dismissEvent);
        }, 1000);
    }
        

    handleDuplicate(event) {
        console.log("Duplicate button clicked!"); // Verify the method is triggered
        console.log("Selected ID:", this.selected_id);

    
        // Fetch values from the fields
        this.name = this.template.querySelector('lightning-input').value;
        this.description = this.template.querySelector('lightning-textarea').value;
        this.drawerid1 = this.selected_id; // Ensure selected_id is set
    
        console.log("Data to send:", this.drawerid1, this.name, this.description, this.databaseId);
    
        // Call the Apex method to create a duplicate drawer
        createDuplicateDrawer({ 
            name: this.name, 
            description: this.description, 
            drawerId: this.drawerid1, 
            databaseId: this.databaseId
        })
        .then(result => {
            console.log('Duplicate Drawer created successfully: ', result);
            // Optionally, show a success message or update the UI
            this.showToast('Success', result, 'success');
                    return refreshApex(this.wiredData);
        })
        .catch(error => {
            console.error('Error creating duplicate drawer: ', error);
            // Optionally, show an error message
        });
        this.isDuplicateModalOpen=false;
    }
    
    
    
    // @track users = [
    //     { id: 1, username: 'Zara_Smith', email: 'zara.smith@example.com', description: 'No description', createdDate: '09/05/2024', isAdmin: true },
    //     { id: 2, username: 'Olivia_Johnson', email: 'olivia.johnson@example.com', description: 'No description', createdDate: '09/04/2024', isAdmin: false },
    //     { id: 3, username: 'Liam_Williams', email: 'liam.williams@example.com', description: 'No description', createdDate: '08/31/2024', isAdmin: true },
    //     { id: 4, username: 'Noah_Brown', email: 'noah.brown@example.com', description: 'No description', createdDate: '08/26/2024', isAdmin: false },
    //     { id: 5, username: 'Sophia_Martin', email: 'sophia.martin@example.com', description: 'No description', createdDate: '08/16/2024', isAdmin: true },
    //     { id: 6, username: 'Mason_Lee', email: 'mason.lee@example.com', description: 'No description', createdDate: '08/13/2024', isAdmin: false },
    //     { id: 7, username: 'Ella_Harris', email: 'ella.harris@example.com', description: 'No description', createdDate: '08/06/2024', isAdmin: true },
    //     { id: 8, username: 'Henry_Clark', email: 'henry.clark@example.com', description: 'No description', createdDate: '06/13/2024', isAdmin: false },
    //     { id: 9, username: 'Jack_King', email: 'jack.king@example.com', description: 'No description', createdDate: '04/10/2024', isAdmin: true },
    //     { id: 10, username: 'Amelia_Wright', email: 'amelia.wright@example.com', description: 'No description', createdDate: '03/10/2024', isAdmin: false },
    //     { id: 1, username: 'Zara_Smith', email: 'zara.smith@example.com', description: 'No description', createdDate: '09/05/2024', isAdmin: true },
    //     { id: 2, username: 'Olivia_Johnson', email: 'olivia.johnson@example.com', description: 'No description', createdDate: '09/04/2024', isAdmin: false },
    //     { id: 3, username: 'Liam_Williams', email: 'liam.williams@example.com', description: 'No description', createdDate: '08/31/2024', isAdmin: true },
    //     { id: 4, username: 'Noah_Brown', email: 'noah.brown@example.com', description: 'No description', createdDate: '08/26/2024', isAdmin: false },
    //     { id: 5, username: 'Sophia_Martin', email: 'sophia.martin@example.com', description: 'No description', createdDate: '08/16/2024', isAdmin: true },
    //     { id: 6, username: 'Mason_Lee', email: 'mason.lee@example.com', description: 'No description', createdDate: '08/13/2024', isAdmin: false },
    //     { id: 7, username: 'Ella_Harris', email: 'ella.harris@example.com', description: 'No description', createdDate: '08/06/2024', isAdmin: true },
    //     { id: 8, username: 'Henry_Clark', email: 'henry.clark@example.com', description: 'No description', createdDate: '06/13/2024', isAdmin: false },
    //     { id: 9, username: 'Jack_King', email: 'jack.king@example.com', description: 'No description', createdDate: '04/10/2024', isAdmin: true },
    //     { id: 10, username: 'Amelia_Wright', email: 'amelia.wright@example.com', description: 'No description', createdDate: '03/10/2024', isAdmin: false },
    //     { id: 1, username: 'Zara_Smith', email: 'zara.smith@example.com', description: 'No description', createdDate: '09/05/2024', isAdmin: true },
    //     { id: 2, username: 'Olivia_Johnson', email: 'olivia.johnson@example.com', description: 'No description', createdDate: '09/04/2024', isAdmin: false },
    //     { id: 3, username: 'Liam_Williams', email: 'liam.williams@example.com', description: 'No description', createdDate: '08/31/2024', isAdmin: true },
    //     { id: 4, username: 'Noah_Brown', email: 'noah.brown@example.com', description: 'No description', createdDate: '08/26/2024', isAdmin: false },
    //     { id: 5, username: 'Sophia_Martin', email: 'sophia.martin@example.com', description: 'No description', createdDate: '08/16/2024', isAdmin: true },
    //     { id: 6, username: 'Mason_Lee', email: 'mason.lee@example.com', description: 'No description', createdDate: '08/13/2024', isAdmin: false },
    //     { id: 7, username: 'Ella_Harris', email: 'ella.harris@example.com', description: 'No description', createdDate: '08/06/2024', isAdmin: true },
    //     { id: 8, username: 'Henry_Clark', email: 'henry.clark@example.com', description: 'No description', createdDate: '06/13/2024', isAdmin: false },
    //     { id: 9, username: 'Jack_King', email: 'jack.king@example.com', description: 'No description', createdDate: '04/10/2024', isAdmin: true },
    //     { id: 10, username: 'Amelia_Wright', email: 'amelia.wright@example.com', description: 'No description', createdDate: '03/10/2024', isAdmin: false }
    // ];

    // // //@track users =this.drawers//[{"id":1,"username":"test1","email":"1@example.com","description":"","createdDate":"2024-06-26","isAdmin":true},{"id":2,"username":"demo","email":"1@example.com","description":"","createdDate":"2024-06-27","isAdmin":true},{"id":3,"username":"abcxyz","email":"1@example.com","description":"demo for salesforce","createdDate":"2024-06-28","isAdmin":true},{"id":4,"username":"Test2","email":"5@example.com","description":"This is a drawer that has name \"Test2\"","createdDate":"2024-07-12","isAdmin":false},{"id":5,"username":"string","email":"1@example.com","description":"string","createdDate":"2024-09-13","isAdmin":true},{"id":6,"username":"string4","email":"1@example.com","description":"string","createdDate":"2024-09-13","isAdmin":true},{"id":7,"username":"sdssdsdsdsd","email":"1@example.com","description":"string","createdDate":"2024-09-13","isAdmin":true},{"id":8,"username":"Balaji","email":"1@example.com","description":"string","createdDate":"2024-09-13","isAdmin":true}]
    // @track filteredUsers = [...this.users];
    

   
    //select row by by default from drawers list [start]
  
    // connectedCallback() {
    //     // Fetch user data when the component is first loaded
    //     this.fetchUsers();
    // }
    // fetchUsers() {
        
    //       // Set default selected_id to the ID of the first user
    //     if (this.filteredUsers.length > 0) {
    //         this.selected_id = this.filteredUsers[0].id;
    //     }
    // }


    // get selectedRowClass() {
        
    //     return (userId) => {
    //         console.log('Evaluating row:', userId); // Log the userId being evaluated
    //         console.log('Selected ID:', this.selected_id); // Log the currently selected ID
    //         // Apply CSS class based on whether the row is selected
    //         return this.selected_id === userId ? 'slds-is-selected' : '';
    //     };
    // }
    selectedRowClass(userId) {
    console.log('Evaluating row:', userId); // Debug log
    console.log('Selected ID:', this.selected_id); // Debug log
    return this.selected_id === userId ? 'slds-is-selected' : '';
    }
   
    //select row by by default from drawers list [END]
     
    // Variables to track which section is visible
    isDashboardVisible = false;
    isDrawerManagementVisible = true;
    // navigateToDrawerManagement=false;
   
    
    // Action Js
    // Handle Action button click
    
    isDropdownVisible = false; // Keeps track of whether the dropdown is visible or hidden

    // Toggles dropdown visibility
    handleClick() {
        this.isDropdownVisible = !this.isDropdownVisible;
    }
    

    // Action Js
    showDrawerManagement(event) {
        event.preventDefault();  // Prevent the page from reloading
        this.isDashboardVisible = false;
        this.isDrawerManagementVisible = true;
        console.log("isdashboard",this.isDrawerManagementVisible)
    }
    
    // Sorting state for columns
    sortDirection = {
        drawers: null,
        createDate: null
    };
    // getSortClass(column, direction) {
    //     return this.sortDirection[column] === direction ? 'slds-is-active' : '';
    // }
    
    // sortDrawers() {
    //     this.toggleSort('drawers');
    //     // Implement sorting logic for "Drawers" column here
    //     // Use this.sortDirection.drawers to get the current direction
    // }

    // sortCreateDate() {
    //     this.toggleSort('createDate');
    //     // Implement sorting logic for "Create Date" column here
    //     // Use this.sortDirection.createDate to get the current direction
    // }

    // toggleSort(column) {
    //     this.sortDirection[column] = this.sortDirection[column] === 'asc' ? 'desc' : 'asc';
    //     // Optionally, you can reset the other column’s sort direction here
    // }

    // getSortClass(column, direction) {
    //     return this.sortDirection[column] === direction ? 'active' : '';
    // }

    // Action drop down values
    navigateToCreateNewDrawer() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/lightning/n/create_new_user' // Using relative path for better maintainability
            }
        });  
    }
    navigateToDashboard() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/lightning/page/home' // Using relative path for better maintainability
            }
        });  
    }

    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        this.filteredUsers = this.users.filter(user =>
            user.username.toLowerCase().includes(searchTerm)
        );
    }


    // handleUserClick(event) {
    //     const userId = event.currentTarget.dataset.id;
    //     this.selectedUser = this.users.find(user => user.id === parseInt(userId));
    // }


    handleSortByName() {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        this.filteredUsers = [...this.users].sort((a, b) => {
            if (a.username < b.username) return this.sortDirection === 'asc' ? -1 : 1;
            if (a.username > b.username) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }


    handleSortByDate() {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        this.filteredUsers = [...this.users].sort((a, b) => {
            const dateA = new Date(a.createdDate);
            const dateB = new Date(b.createdDate);
            return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }
   
   
    // remove model js //duplication model //purge model
     
   
    // Open the modal when "Remove Drawer" is clicked
    openModal() {
        this.isModalOpen = true;
    }
    openPurge(){
        this.isPurgeOpen=true;
    }
    openDuplicateModal(){
        this.isDuplicateModalOpen  = true;
    }

    // Close the modal
    closeModal() {
        this.isModalOpen = false;
    
    }
    isCancel() {
        this.isPurgeOpen = false;
        console.log("is cancel");
    
    }

    // Handle the "Yes" button logic (can be customized based on your needs)
    handleGoBack() {
        // Your logic to handle the "Yes" button action (e.g., removing the drawer)
        console.log('Drawer removal confirmed');
        this.closeModal();
    }
    

   
    
    // Duplicate model
    openDuplicateModal() {
        this.isDuplicateModalOpen = true;
    }

    // Close the "Duplicate Drawer" modal
    closeDuplicateModal() {
        this.isDuplicateModalOpen = false;
    }

    // Handle the duplicate action (add your logic here)
   
}