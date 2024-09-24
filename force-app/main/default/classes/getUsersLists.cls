public class getUsersLists {
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getDrawers() {
        List<Map<String, Object>> formattedDrawerList = new List<Map<String, Object>>();

        String apiUrl = 'https://43f7-113-161-65-206.ngrok-free.app/api/v1/user/list';
        Integer skip = 0; 
        Integer take = 20;
        
        String requestUrl = apiUrl + '?skip=' + skip + '&take=' + take;

        HttpRequest req = new HttpRequest();
        req.setEndpoint(requestUrl);
        req.setMethod('GET');
        req.setHeader('Authorization', TokenManager.getBearerToken());
        req.setHeader('x-tenant-id', TokenManager.getTenantId());
        req.setHeader('Accept', 'application/json');

        Http http = new Http();
        HttpResponse res;

        try {
            res = http.send(req);
            System.debug('Request URL: ' + requestUrl);
            System.debug('Response Status Code: ' + res.getStatusCode());
            System.debug('Response Body: ' + res.getBody());

            // Parse the response body
            String responseBody = res.getBody();
            Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(responseBody);
            System.debug('Response Map: ' + responseMap);

            // Check for the 'payload' key and extract 'data'
            if (responseMap.containsKey('payload')) {
                Map<String, Object> payloadMap = (Map<String, Object>) responseMap.get('payload');
                if (payloadMap.containsKey('data') && payloadMap.get('data') instanceof List<Object>) {
                    List<Object> dataList = (List<Object>) payloadMap.get('data');

                    for (Object obj : dataList) {
                        if (obj instanceof Map<String, Object>) {
                            Map<String, Object> drawer = (Map<String, Object>) obj;
                            Map<String, Object> drawerMap = new Map<String, Object>();
                            drawerMap.put('id', (Integer) drawer.get('id'));
                            drawerMap.put('username', (String) drawer.get('username')); // Correct field name
                            drawerMap.put('created_at', formatDate((String) drawer.get('created_at'))); // Format the date
                            formattedDrawerList.add(drawerMap);
                        }
                    }
                } else {
                    System.debug('Unexpected payload data structure: ' + payloadMap.get('data'));
                }
            } else {
                System.debug('Unexpected response structure: ' + responseMap);
            }
        } catch (Exception e) {
            System.debug('Exception: ' + e.getMessage());
        }

        return formattedDrawerList;
    }

    private static String formatDate(String dateString) {
        if (String.isNotBlank(dateString)) {
            try {
                // Extract date part from the ISO 8601 format
                return dateString.substring(0, 10); // Returns the date in 'yyyy-MM-dd'
            } catch (Exception e) {
                System.debug('Error parsing date: ' + e.getMessage() + ' - Date String: ' + dateString);
                return 'Invalid Date'; // Return 'Invalid Date' if parsing fails
            }
        }
        return 'N/A'; // Return 'N/A' if dateString is blank
    }
}