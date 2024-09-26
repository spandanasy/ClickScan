public class CreateNewDrawerController {
    @AuraEnabled
    public static String createDrawer(String username, String description, String fieldName, Integer fieldWidth, String fieldFormat) {
        String newdrawerurl = TokenManager.getApiUrl() + '/api/v1/drawer';
        HttpRequest req = new HttpRequest();
        req.setEndpoint(newdrawerurl);
        req.setMethod('POST');
        req.setHeader('accept', 'application/json');
        req.setHeader('x-tenant-id', TokenManager.getTenantId());
        req.setHeader('Authorization', TokenManager.getBearerToken());
        req.setHeader('Content-Type', 'application/json');

        // Static details
        String staticName = username;
        String staticDescription = description;
        Integer staticDatabaseId = 1;
        String staticImagePath = '/static/path/to/image.png';
        Boolean staticSecurePath = true;

        // Static fields data
        List<Map<String, Object>> staticFieldList = new List<Map<String, Object>>();

        Map<String, Object> fieldMap = new Map<String, Object>();
        fieldMap.put('name', fieldName);
        fieldMap.put('width', fieldWidth);
        fieldMap.put('format_id', fieldFormat);
        fieldMap.put('description', 'Static Field Description');
        fieldMap.put('order_no', 1);

        List<Map<String, Object>> lists = new List<Map<String, Object>>();
        Map<String, Object> listMap = new Map<String, Object>();
        listMap.put('name', 'Static List Name');
        listMap.put('ordered', 1);
        lists.add(listMap);

        fieldMap.put('lists', lists);
        fieldMap.put('redflag', new List<Integer>{0});

        staticFieldList.add(fieldMap);

        // Construct the request body with static details
        Map<String, Object> requestBody = new Map<String, Object>();
        requestBody.put('name', staticName);
        requestBody.put('description', staticDescription);
        requestBody.put('database_id', staticDatabaseId);
        requestBody.put('image_path', staticImagePath);
        requestBody.put('secure_path', staticSecurePath);
        requestBody.put('fields', staticFieldList);

        req.setBody(JSON.serialize(requestBody));

        Http http = new Http();
        HttpResponse res = http.send(req);

        // Check the response status code and body
        Integer statusCode = res.getStatusCode();
        String responseBody = res.getBody();

        System.debug('HTTP Status Code: ' + statusCode);
        System.debug('Response Body: ' + responseBody);

        return responseBody;

        // if (statusCode == 200) {
        //     return 'Data posted successfully. Response: ' + responseBody;
        // } else {
        //     return 'Failed to post data. Status code: ' + statusCode + ', Response: ' + responseBody;
        // }
    }
}