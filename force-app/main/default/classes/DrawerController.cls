public with sharing class DrawerController {
    // Define the tenant ID and authorization token as class-level variables
    
    @AuraEnabled(cacheable=true)
    public static Map<String, Integer> getDashboardData() {
        String dashboardAPI = TokenManager.getApiUrl() + '/api/v1/drawer/list';
        Http http = new Http();
        Map<String, Integer> result = new Map<String, Integer>();
        Integer totalFolders = 0;  // To track total folder count

        // Fetch drawer count
        HttpRequest drawerRequest = new HttpRequest();
        drawerRequest.setMethod('GET');
        drawerRequest.setHeader('Content-Type', 'application/json');
        drawerRequest.setHeader('x-tenant-id', TokenManager.getTenantId());
        drawerRequest.setHeader('Authorization', TokenManager.getBearerToken());

        String drawerParams = '?skip=0&take=1000';
        drawerRequest.setEndpoint(dashboardAPI + drawerParams);

        HttpResponse drawerResponse = http.send(drawerRequest);

        if (drawerResponse.getStatusCode() == 200) {
            Map<String, Object> drawerResultsMap = (Map<String, Object>) JSON.deserializeUntyped(drawerResponse.getBody());
            Map<String, Object> drawerPayload = (Map<String, Object>) drawerResultsMap.get('payload');
            List<Object> drawers = (List<Object>) drawerPayload.get('data');

            // Store drawer count
            result.put('drawerCount', drawers.size());

            // Iterate through each drawer to fetch folder count
            for (Object drawerObj : drawers) {
                Map<String, Object> drawer = (Map<String, Object>) drawerObj;
                Integer drawerId = (Integer) drawer.get('id');
                
                // Fetch folder count for this drawer
                totalFolders += getFolderCountForDrawer(drawerId);
            }

            // Store total folder count
            result.put('folderCount', totalFolders);
        } else {
            // Error handling for drawer request
            result.put('drawerCount', 0);
            result.put('folderCount', 0);
        }

        // Fetch user count
        HttpRequest userRequest = new HttpRequest();
        userRequest.setMethod('GET');
        userRequest.setHeader('Content-Type', 'application/json');
        userRequest.setHeader('x-tenant-id', TokenManager.getTenantId());
        userRequest.setHeader('Authorization', TokenManager.getBearerToken());

        String userParams = '?skip=0&take=1000';
        userRequest.setEndpoint('https://43f7-113-161-65-206.ngrok-free.app/api/v1/user/list' + userParams);

        HttpResponse userResponse = http.send(userRequest);

        if (userResponse.getStatusCode() == 200) {
            Map<String, Object> userResultsMap = (Map<String, Object>) JSON.deserializeUntyped(userResponse.getBody());
            Map<String, Object> userPayload = (Map<String, Object>) userResultsMap.get('payload');
            List<Object> users = (List<Object>) userPayload.get('data');

            // Store user count
            result.put('userCount', users.size());
        } else {
            // Error handling for user request
            result.put('userCount', 0);
        }

        // Return drawer count, folder count, and user count
        return result;
    }

    // Helper method to fetch folder count for a specific drawer
    private static Integer getFolderCountForDrawer(Integer drawerId) {
        Http http = new Http();
        HttpRequest folderRequest = new HttpRequest();
        folderRequest.setMethod('GET');
        folderRequest.setHeader('Content-Type', 'application/json');
        folderRequest.setHeader('x-tenant-id', TokenManager.getTenantId());
        folderRequest.setHeader('Authorization', TokenManager.getBearerToken());

        // Set endpoint dynamically with the drawer ID
        folderRequest.setEndpoint('https://43f7-113-161-65-206.ngrok-free.app/api/v1/folder?drawer_id=' + drawerId + '&skip=0&take=1000');
        
        HttpResponse folderResponse = http.send(folderRequest);

        if (folderResponse.getStatusCode() == 200) {
            Map<String, Object> folderResultsMap = (Map<String, Object>) JSON.deserializeUntyped(folderResponse.getBody());
            if (folderResultsMap.containsKey('payload')) {
                Map<String, Object> folderPayload = (Map<String, Object>) folderResultsMap.get('payload');
                if (folderPayload.containsKey('data')) {
                    Map<String, Object> dataMap = (Map<String, Object>) folderPayload.get('data');
                    if (dataMap.containsKey('folders')) {
                        List<Object> folders = (List<Object>) dataMap.get('folders');
                        // Return the number of folders for this drawer
                        return folders.size();
                    }
                }
            }
        }
        // Return 0 if there's an error or no folders
        return 0;
    }
}