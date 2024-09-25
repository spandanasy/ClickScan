public with sharing class OrganizationUserController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getOrgAndUserInfo() {
        Map<String, Object> result = new Map<String, Object>();
        
        // Query organization details
        Organization org = [SELECT Name, Id FROM Organization LIMIT 1];
        result.put('orgName', org.Name);
        result.put('orgId', org.Id);
        
        // Query current user details
        User currentUser = [SELECT Name FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        result.put('userName', currentUser.Name);
        
        // Query all users' names
        List<User> allUsers = [SELECT Name FROM User];
        List<String> userNames = new List<String>();
        for (User u : allUsers) {
            userNames.add(u.Name);
        }
        result.put('allUserNames', userNames);
        
        return result;
    }
}