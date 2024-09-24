public class getUsersInfo {
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getDrawerById(Integer id) {
        // Define a list to hold the user data map
        List<Map<String, Object>> userList = new List<Map<String, Object>>();

        // Validate id input
        if (id == null) {
            // Log the error and return an empty list instead of throwing an exception
            System.debug('User ID is null. Returning an empty list.');
            return userList; // Return an empty list in case of null id
        }

        // Define the base API URL and append the id
        String apiUrl = TokenManager.getApiUrl() + '/api/v1/user/' + id;
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint(apiUrl);
        req.setMethod('GET');
        req.setHeader('Authorization', TokenManager.getBearerToken());
        req.setHeader('x-tenant-id', TokenManager.getTenantId());
        req.setHeader('Accept', 'application/json');

        Http http = new Http();
        HttpResponse res;

        try {
            // Make the HTTP request
            res = http.send(req);
            
            System.debug('Request URL: ' + apiUrl);
            System.debug('Response Status Code: ' + res.getStatusCode());
            System.debug('Response Body: ' + res.getBody());

            // Check if the request is forbidden
            if (res.getStatusCode() == 403) {
                System.debug('Access forbidden (403). Returning an empty list.');
                return userList; // Return empty list in case of 403 error
            }

            // Handle response based on success
            if (res.getStatusCode() == 200) {
                // Parse the response body as a Map
                Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());

                // Extract the payload from the response
                if (responseMap.containsKey('payload')) {
                    Map<String, Object> payload = (Map<String, Object>) responseMap.get('payload');

                    // Handling null values and creating a map for the user data
                    Map<String, Object> userMap = new Map<String, Object>();
                    userMap.put('id', payload.get('id') != null ? payload.get('id') : 'N/A');
                    userMap.put('username', payload.get('username') != null ? payload.get('username') : 'N/A');
                    userMap.put('email', payload.get('email') != null ? payload.get('email') : 'N/A');
                    userMap.put('description', payload.get('description') != null ? payload.get('description') : 'N/A');
                    userMap.put('created_at', payload.get('created_at') != null ? payload.get('created_at') : 'N/A');
                    userMap.put('is_first_login', payload.get('is_first_login') != null ? payload.get('is_first_login') : false);
                    userMap.put('thumbnail', payload.get('thumbnail') != null ? payload.get('thumbnail') : 'N/A');

                    // Add the user data map to the list
                    userList.add(userMap);
                } else {
                    System.debug('No payload found in the response. Returning an empty list.');
                }
            } else {
                System.debug('Non-success status code: ' + res.getStatusCode() + '. Returning an empty list.');
            }
        } catch (Exception e) {
            System.debug('Exception occurred: ' + e.getMessage());
            // Log the error and return an empty list without throwing an exception
        }

        // Return the list containing the user data map
        return userList;
    }
}