public with sharing class RemoveDrawerID {
    @AuraEnabled
    public static String removeDrawer(String drawerId) {
        String apiUrl = TokenManager.getApiUrl() + '/api/v1/drawer/' + drawerId;
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint(apiUrl);
        req.setMethod('DELETE');
        req.setHeader('Authorization', TokenManager.getBearerToken());
        req.setHeader('x-tenant-id', TokenManager.getTenantId());
        req.setHeader('Accept', 'application/json');

        Http http = new Http();
        HttpResponse res;

        try {
            res = http.send(req);
            System.debug('Request URL: ' + apiUrl);
            System.debug('Response Status Code: ' + res.getStatusCode());
            System.debug('Response Body: ' + res.getBody());

            if (res.getStatusCode() == 200 || res.getStatusCode() == 204) {
                return 'Drawer successfully removed.';
            } else {
                return 'Failed to remove drawer. Status Code: ' + res.getStatusCode() + ', Response: ' + res.getBody();
            }
        } catch (Exception e) {
            System.debug('Exception: ' + e.getMessage());
            return 'Exception occurred: ' + e.getMessage();
        }
    }
}