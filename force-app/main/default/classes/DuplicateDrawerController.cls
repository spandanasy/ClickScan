public with sharing class DuplicateDrawerController {

    @AuraEnabled
    public static String createDuplicateDrawer(String name, String description, String drawerId, String databaseId) {
        String apiUrl = TokenManager.getApiUrl() + '/api/v1/drawer/duplicate'; // API URL for duplicating drawer Fetch Bearer token

        // Create a new map for the payload to send in the POST request
        Map<String, Object> payload = new Map<String, Object>();
        payload.put('name', name);
        payload.put('description', description);
        payload.put('drawer_id', drawerId);
        payload.put('database_id', databaseId);

        // Convert the payload map to JSON format
        String payloadJson = JSON.serialize(payload);
        System.debug('Payload JSON: ' + payloadJson);

        // Set up the HTTP request
        HttpRequest req = new HttpRequest();
        req.setEndpoint(apiUrl);
        req.setMethod('POST');
        req.setHeader('Authorization', TokenManager.getBearerToken()); // Authorization header
        req.setHeader('x-tenant-id', TokenManager.getTenantId()); // Tenant ID header
        req.setHeader('Content-Type', 'application/json'); // Content-Type header
        req.setBody(payloadJson); // Set the request body to the JSON payload

        // Create an instance of the HTTP class and send the request
        Http http = new Http();
        HttpResponse res;

        try {
            res = http.send(req); // Send the POST request
            System.debug('Response Status Code: ' + res.getStatusCode());
            System.debug('Response Body: ' + res.getBody());

            // Check for a successful status code (e.g., 200 or 201)
            if (res.getStatusCode() == 200 || res.getStatusCode() == 201) {
                return 'Duplicate Drawer created successfully.';
            } else {
                return 'Failed to create duplicate drawer. Status Code: ' + res.getStatusCode();
            }
        } catch (Exception e) {
            System.debug('Error during HTTP callout: ' + e.getMessage());
            return 'Error creating duplicate drawer: ' + e.getMessage();
        }
    }
}