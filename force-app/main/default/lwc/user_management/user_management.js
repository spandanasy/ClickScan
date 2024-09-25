import { LightningElement,track, wire,api } from 'lwc';
// import logo from '@salesforce/resourceUrl/clickScan';
import icon from '@salesforce/resourceUrl/user_icon';
import getDrawers from '@salesforce/apex/getUsersLists.getDrawers';
import getDrawerById from '@salesforce/apex/getUsersInfo.getDrawerById';



export default class UserManagement extends LightningElement {
    iconUrl = icon;
    isVisible = false;
   
    

    // Toggles the visibility of the checkbox list
    toggleCheckboxList() {
        this.isVisible = !this.isVisible;
    }
    @track drawers = []; // To store the fetched drawer data
    @track error; // To store any errors
    @track users = []; // To store the users data
    @track filteredUsers = []; // To store filtered users (for template iteration)
    @track sortDirection = 'asc'; // Default sort direction for sorting users
    @track selectedUser = null;
    @api userId; // or set this through other means
    @track userData={
        username:'N/A',
        description:'N/A',
        created_at:'N/A',
        email:'N/A',
        thumbnail:'N/A'

    }
    // Fetch data from Apex controller
    
    // @wire(getDrawers)
    // wiredDrawers({ error, data }) {
    //     console.log("Fetching drawer data...");
    //     if (data) {
    //         this.drawers = data;
    //         this.users = [...this.drawers]; // Assign drawer data to users
    //         this.filteredUsers = [...this.users]; // Assign users to filteredUsers
    //         console.log('Drawers data:', JSON.stringify(this.drawers)); // Log the data to the console

    //         if (this.filteredUsers.length > 0) {
    //             this.selectedUser = this.filteredUsers[0]; // Select the first user by default
    //             this.userId = this.selectedUser.id; // Automatically set userId to trigger the second @wire method
    //             console.log('Selected User ID:', this.userId);
    //             console.log('Selected User:', JSON.stringify(this.selectedUser));
    //         }
    //     } else if (error) {
    //         this.error = error;
    //         console.error('Error fetching drawers:', JSON.stringify(this.error)); // Log errors to the console
    //     }
    // }

    // // Fetching the user details based on the selected userId
    // @wire(getDrawerById, { id: '$userId' })
    // wiredUser({ error, data }) {
    //     if (data) {
    //         this.userData = data[0]; // Assuming the data returned is an array and we take the first element
    //         console.log('User Data:', this.userData);
    //         this.error = undefined;
    //     } else if (error) {
    //         this.error = error;
    //         console.error('Error:', error);
    //     }
    // }
    @wire(getDrawers)
    wiredDrawers({ error, data }) {
    console.log("Fetching drawer data...");
    if (data) {
        this.drawers = data;
        this.users = [...this.drawers]; // Assign drawer data to users
        this.filteredUsers = [...this.users]; // Assign users to filteredUsers
        console.log('Drawers data:', JSON.stringify(this.drawers)); // Log the data to the console

        if (this.filteredUsers.length > 0) {
            this.selected_id = this.filteredUsers[0].id;
            this.userId = this.selected_id;
            this.selectedUser = this.filteredUsers[0];
            console.log("Selected User ID:", this.userId);

            // Add a delay before fetching user details by ID
            setTimeout(() => {
                console.log("Fetching user details for ID:", this.userId);
                this.fetchUserDetails();
            }, 3000); // Delay of 2 seconds
        }
    } else if (error) {
        this.error = error;
        console.error('Error fetching drawers:', JSON.stringify(this.error)); // Log errors to the console
    }
}

// Create a method to fetch user details by ID
fetchUserDetails() {
    console.log('this.userId tippu',this.userData);
    getDrawerById({ id: this.userId })
        .then((data) => {
            this.userData = data[0];
            console.log('User Data:', this.userData);
        })
        .catch((error) => {
            console.error('Error fetching user details:', error);
        });
}

        // Handle User Click Event
    // handleUserClick(event) {
    //     // Get the current clicked row
    //     const clickedRow = event.currentTarget;

    // Get all rows
    // const allRows = this.template.querySelectorAll('tr.slds-hint-parent');

    // Remove 'highlighted' class from all rows and add 'standby' class
    // allRows.forEach(row => {
    //     row.classList.remove('highlighted');
    //     row.classList.add('standby');
    // });

    // Add 'highlighted' class to the clicked row and remove 'standby' class
    // clickedRow.classList.add('highlighted');
    // clickedRow.classList.remove('standby');
        
    //     const userId = event.currentTarget.dataset.id;
    //     this.selectedUser = this.users.find(user => user.id === parseInt(userId, 10));
    //     console.log('Selected User:', JSON.stringify(this.selectedUser));
    // }
     
    handleUserClick(event) {
        console.log("handle user click");
        // Get the selected user ID from the clicked element
        const userId = event.currentTarget.dataset.id; // This is usually a string
        this.selected_id = userId; // Store the selected ID
        console.log("Selected ID:", this.selected_id); // Log selected_id
        console.log("User ID:", userId); // Log userId
    
        // Find the clicked user in the filtered users list
        const clickedUser = this.filteredUsers.find(user => user.id === userId || user.id === parseInt(userId, 10));
        console.log('clicked_user',clickedUser);
        if (clickedUser) {
            this.selectedUser = clickedUser; // Update the selected user
            this.userId=this.selectedUser.id;
            console.log("Selected User:", this.selectedUser,this.selectedUser.id);
    
            // Fetch user details for the selected user
            this.fetchUserDetails(); // Call the method to fetch user details
        } else {
            // If the clicked user is not found, reset userData
            this.userData = {
                username: 'N/A',
                email: 'N/A',
                description: 'N/A',
                createdDate: 'N/A',
                thumbnail:'N/A',
            };
        }
    }
    
    // Create a method to fetch user details by ID
    fetchUserDetails() {
        console.log("Fetching user details for ID:", this.selected_id);
        getDrawerById({ id: this.userId})
            .then((data) => {
                if (data.length > 0) {
                    this.userData = data[0]; // Assign the fetched user data to userData
                    console.log('User Data:', this.userData);
                } else {
                    this.userData = {
                        username: 'N/A',
                        email: 'N/A',
                        description: 'N/A',
                        createdDate: 'N/A',
                        thumbnail:'N/A',
                    };
                }
            })
            .catch((error) => {
                console.error('Error fetching user details:', error);
                // Reset userData in case of error
                this.userData = {
                    username: 'N/A',
                    email: 'N/A',
                    description: 'N/A',
                    createdDate: 'N/A',
                    thumbnail:'N/A'
                };
            });
    }
    







    // Sorting Functionality (Optional)
    sortUsersBy(field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        const isAsc = this.sortDirection === 'asc';

        this.filteredUsers.sort((a, b) => {
            const valA = a[field].toLowerCase();
            const valB = b[field].toLowerCase();
            return isAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });
    }
    // Gets the appropriate CSS class based on visibility state
    get checkboxClass() {
        return this.isVisible ? 'checkbox-list show' : 'checkbox-list';
    }
    @track drawerPermissions = [
        { id: 1, label: 'Permission 1', isOpen: false, iconName: 'utility:chevronright' },
        { id: 2, label: 'Permission 2', isOpen: false, iconName: 'utility:chevronright' },
        { id: 3, label: 'Permission 3', isOpen: false, iconName: 'utility:chevronright' },
        { id: 4, label: 'Permission 4', isOpen: false, iconName: 'utility:chevronright' }
    ];

    toggleDropdown(event) {
        const drawerId = parseInt(event.currentTarget.dataset.id, 10);
        this.drawerPermissions = this.drawerPermissions.map(drawer => {
            if (drawer.id === drawerId) {
                const isOpen = !drawer.isOpen;
                return { ...drawer, isOpen: isOpen, iconName: isOpen ? 'utility:chevrondown' : 'utility:chevronright' };
            }
            return drawer;
        });
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
    //     { id: 10, username: 'Amelia_Wright', email: 'amelia.wright@example.com', description: 'No description', createdDate: '03/10/2024', isAdmin: false }
    // ];

    // @track filteredUsers = [...this.users];
    // @track selectedUser = null;
    // @track sortDirection = 'asc'; // Default sort direction

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

    handleEditClick() {
        alert('Edit functionality is not implemented yet.');
    }

    handleResetPassword() {
        alert('Reset Password functionality is not implemented yet.');
    }

    handleAdminToggle(event) {
        if (this.selectedUser) {
            this.selectedUser.isAdmin = event.target.checked;
        }
    }

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

    // get logoUrl() {
    //     return logo;
    // }

    globalPermissions = [
        'Display',
        'Create Folder',
        'Delete Folder',
        'Modify Index Field',
        'Modify Page',
        'Modify Annotation',
        'Scan',
        'Export',
        'Migrate Folder',
        'Print',
        'Batch Management'
    ];

    drawerPermissions = [
        'DOCUMENTS',
        'Key_Ref',
        'Drawer_1',
        'DRAWER_0310'
    ];
    
    // Handle User Click Event
    // handleUserClick(event) {
    //     const userId = event.currentTarget.dataset.id;
    //     console.log("kamawid",userId);
    //     this.selectedUser = this.users.find(user => user.id === parseInt(userId, 10));
    //     console.log('Selected User:', JSON.stringify(this.selectedUser));
    //     this.userId = userId; 
    //     console.log("kamalxid",this.userId);
    // }

    // Sorting Functionality (Optional)
    sortUsersBy(field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        const isAsc = this.sortDirection === 'asc';

        this.filteredUsers.sort((a, b) => {
            const valA = a[field].toLowerCase();
            const valB = b[field].toLowerCase();
            return isAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });
    }
 
}