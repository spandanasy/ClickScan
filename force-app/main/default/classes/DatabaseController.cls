public class DatabaseController {
        @AuraEnabled(cacheable=true)
    public static String getDatabaseDetails() {
        String databaseApiUrl = TokenManager.getApiUrl() + '/api/v1/database/list?skip=0&take=1';
        HttpRequest req = new HttpRequest();
        req.setEndpoint(databaseApiUrl);
        req.setMethod('GET');
        req.setHeader('Authorization', TokenManager.getBearerToken());
        req.setHeader('Accept', 'application/json');

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200) {
            return res.getBody();
        } else {
            throw new AuraHandledException('Error retrieving database details: ' + res.getStatus());
        }
    }
}
