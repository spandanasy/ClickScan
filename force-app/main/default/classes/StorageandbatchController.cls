public with sharing class StorageandbatchController {

    // Centralized config
    private static final String BASE_URL = 'https://clickscan.terralogic.com/client/api/v1';
    private static final String TENANT_ID = 'fFBurbwxgG';
    private static final String BEARER_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7ImlkIjoxMDcyLCJlbWFpbCI6InNwYW5kYW5hLnN5QHRlcnJhbG9naWMuY29tIiwidXNlcm5hbWUiOiJDTElDS1NDQU5fU0YiLCJyb2xlcyI6WyJBRE1JTiIsIkNMSUVOVCJdfSwiaWF0IjoxNzYwNDE0NDk4LCJleHAiOjE3NjA0NTc2OTh9.of7Ca9haynqeifVMWpB2NTaKhWYBD2mQg5K-PCG0SjI';
    private static final Integer DRAWER_ID = 14;

    // Helpers
    private static Blob mergeBlobs(List<Blob> parts) {
        String encoded = '';
        for (Blob b : parts) encoded += EncodingUtil.base64Encode(b);
        return EncodingUtil.base64Decode(encoded);
    }

    // BATCH METHODS

    @AuraEnabled
    public static String createBatch(String name) {
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(BASE_URL + '/batch');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('x-tenant-id', TENANT_ID);
        req.setHeader('Authorization', BEARER_TOKEN);

        Map<String, Object> payload = new Map<String, Object>{
            'drawer_id' => DRAWER_ID,
            'name' => name
        };
        req.setBody(JSON.serialize(payload));

        HttpResponse res = http.send(req);
        return res.getBody();
    }

    @AuraEnabled
    public static String uploadFileToBatch(String base64File, String fileName, String contentType, String batchId) {
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(BASE_URL + '/batch_file/upload');
        req.setMethod('POST');
        req.setHeader('Authorization', BEARER_TOKEN);
        req.setHeader('x-tenant-id', TENANT_ID);

        String boundary = '----WebKitFormBoundary' + String.valueOf(DateTime.now().getTime());
        req.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);

        // Multipart form-data
        String bodyStart = '';
        bodyStart += '--' + boundary + '\r\n';
        bodyStart += 'Content-Disposition: form-data; name="batch_id"\r\n\r\n' + batchId + '\r\n';

        bodyStart += '--' + boundary + '\r\n';
        bodyStart += 'Content-Disposition: form-data; name="order_no"\r\n\r\n0\r\n';

        bodyStart += '--' + boundary + '\r\n';
        bodyStart += 'Content-Disposition: form-data; name="location"\r\n\r\ndefault\r\n';

        bodyStart += '--' + boundary + '\r\n';
        bodyStart += 'Content-Disposition: form-data; name="files[]"; filename="' + fileName + '"\r\n';
        bodyStart += 'Content-Type: ' + (String.isNotBlank(contentType) ? contentType : 'application/octet-stream') + '\r\n\r\n';

        Blob bodyStartBlob = Blob.valueOf(bodyStart);
        Blob fileBlob = EncodingUtil.base64Decode(base64File);
        // Blob bodyEndBlob = Blob.valueOf('\r\n--' + boundary + '--');
        Blob bodyEndBlob = Blob.valueOf('\r\n--' + boundary + '--\r\n');


        Blob fullBody = mergeBlobs(new List<Blob>{ bodyStartBlob, fileBlob, bodyEndBlob });
        req.setBodyAsBlob(fullBody);

        HttpResponse res = http.send(req);
        return res.getBody();
    }

    @AuraEnabled(cacheable=false)
    public static List<Map<String, Object>> getBatchList() {
        try {
            Integer skip = 0, take = 100;
            String sortOrder = 'ASC';

            String apiUrl = BASE_URL + '/batch/search-full'
                + '?drawer_id=' + DRAWER_ID
                + '&skip=' + skip
                + '&take=' + take
                + '&sort=' + sortOrder;

            HttpRequest req = new HttpRequest();
            req.setEndpoint(apiUrl);
            req.setMethod('GET');
            req.setHeader('X-Tenant-ID', TENANT_ID);
            req.setHeader('Authorization', BEARER_TOKEN);
            req.setHeader('Content-Type', 'application/json');

            Http http = new Http();
            HttpResponse res = http.send(req);

            if (res.getStatusCode() == 200) {
                Map<String, Object> parsed = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                Map<String, Object> payload = (Map<String, Object>) parsed.get('payload');
                List<Object> data = (List<Object>) payload.get('data');

                List<Map<String, Object>> resultList = new List<Map<String, Object>>();
                for (Object o : data) {
                    resultList.add((Map<String, Object>) o);
                }
                return resultList;
            } else {
                throw new AuraHandledException('API Error: ' + res.getStatusCode() + ' - ' + res.getBody());
            }
        } catch (Exception e) {
            throw new AuraHandledException('Exception in getBatchList: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static String deleteBatches(List<Integer> ids) {
        try {
            String url = BASE_URL + '/batch/delete-multiple';
            Map<String, Object> body = new Map<String, Object>{ 'ids' => ids };

            HttpRequest req = new HttpRequest();
            req.setEndpoint(url);
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('x-tenant-id', TENANT_ID);
            req.setHeader('Authorization', BEARER_TOKEN);
            req.setBody(JSON.serialize(body));

            Http http = new Http();
            HttpResponse res = http.send(req);

            Integer statusCode = res.getStatusCode();
            if (statusCode == 200 || statusCode == 201 || statusCode == 204) {
                return 'success';
            } else {
                return 'error: ' + statusCode + ' - ' + res.getBody();
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error in deleteBatches: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=false)
    public static List<Map<String, Object>> getFilesByBatch(Integer batchId) {
        try {
            String apiUrl = BASE_URL + '/batch_file/batch'
                + '?id=' + batchId + '&skip=1&take=100';

            HttpRequest req = new HttpRequest();
            req.setEndpoint(apiUrl);
            req.setMethod('GET');
            req.setHeader('X-Tenant-ID', TENANT_ID);
            // Ensure proper Bearer prefix (same as Storage)
            req.setHeader('Authorization',
                BEARER_TOKEN != null && BEARER_TOKEN.startsWithIgnoreCase('Bearer ')
                    ? BEARER_TOKEN
                    : 'Bearer ' + BEARER_TOKEN
            );

            HttpResponse res = new Http().send(req);
            if (res.getStatusCode() != 200) {
                throw new AuraHandledException('Batch API Error: ' + res.getStatusCode() + ' - ' + res.getBody());
            }

            // Defensive parsing (same pattern as Storage)
            Map<String, Object> parsed = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            if (parsed == null || !parsed.containsKey('payload')) {
                throw new AuraHandledException('Malformed response: missing "payload".');
            }
            Map<String, Object> payload = (Map<String, Object>) parsed.get('payload');
            if (payload == null || !payload.containsKey('data')) {
                throw new AuraHandledException('Malformed response: missing "payload.data".');
            }

            List<Object> data = (List<Object>) payload.get('data');
            List<Map<String, Object>> out = new List<Map<String, Object>>();
            for (Object o : data) if (o instanceof Map<String, Object>) out.add((Map<String, Object>) o);
            return out;

        } catch (AuraHandledException ahe) {
            throw ahe;
        } catch (Exception e) {
            throw new AuraHandledException('Error in getFilesByBatch: ' + e.getMessage());
        }
    }

@AuraEnabled(cacheable=false)
public static String getBatchFileStream(Integer fileId) {
    try {
        String apiUrl = BASE_URL + '/batch_file/' + fileId + '/stream';

        HttpRequest req = new HttpRequest();
        req.setEndpoint(apiUrl);
        req.setMethod('GET');
        req.setHeader('X-Tenant-ID', TENANT_ID);
        req.setHeader('Authorization',
            BEARER_TOKEN != null && BEARER_TOKEN.startsWithIgnoreCase('Bearer ')
                ? BEARER_TOKEN
                : 'Bearer ' + BEARER_TOKEN
        );

        HttpResponse res = new Http().send(req);
        if (res.getStatusCode() != 200) {
            throw new AuraHandledException('Batch API Error: ' + res.getStatusCode() + ' - ' + res.getBody());
        }

        Map<String, Object> parsed  = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        Map<String, Object> payload = (Map<String, Object>) parsed.get('payload');

        if (payload == null || !payload.containsKey('file')) {
            throw new AuraHandledException('No "file" field found in batch payload.');
        }
        return String.valueOf(payload.get('file')); // base64

    } catch (AuraHandledException ahe) {
        throw ahe;
    } catch (Exception e) {
        throw new AuraHandledException('Error in getBatchFileStream: ' + e.getMessage());
    }
}



    // STORAGE METHODS

    @AuraEnabled(cacheable=false)
    public static String createDirectory(String name) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(BASE_URL + '/directory');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('X-Tenant-ID', TENANT_ID);
        req.setHeader('Authorization', BEARER_TOKEN);
        req.setBody(JSON.serialize(new Map<String, Object>{
            'drawer_id' => DRAWER_ID,
            'name'      => name
        }));
        return new Http().send(req).getBody(); // LWC parses JSON
    }

    @AuraEnabled(cacheable=false)
    public static String uploadFileToDirectory(String base64File, String fileName, String contentType, String directoryId) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(BASE_URL + '/directory_file/upload');
        req.setMethod('POST');
        req.setHeader('Authorization', BEARER_TOKEN);
        req.setHeader('X-Tenant-ID', TENANT_ID);

        String boundary = '----WebKitFormBoundary' + String.valueOf(DateTime.now().getTime());
        req.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);

        String bodyStart =
            '--' + boundary + '\r\n' +
            'Content-Disposition: form-data; name="directory_id"\r\n\r\n' + directoryId + '\r\n' +
            '--' + boundary + '\r\n' +
            'Content-Disposition: form-data; name="order_no"\r\n\r\n0\r\n' +
            '--' + boundary + '\r\n' +
            'Content-Disposition: form-data; name="location"\r\n\r\ndefault\r\n' +
            '--' + boundary + '\r\n' +
            'Content-Disposition: form-data; name="files[]"; filename="' + fileName + '"\r\n' +
            'Content-Type: ' + (String.isNotBlank(contentType) ? contentType : 'application/octet-stream') + '\r\n\r\n';

        Blob fullBody = mergeBlobs(new List<Blob>{
            Blob.valueOf(bodyStart),
            EncodingUtil.base64Decode(base64File),
            Blob.valueOf('\r\n--' + boundary + '--')
        });
        req.setBodyAsBlob(fullBody);

        return new Http().send(req).getBody();
    }

    @AuraEnabled(cacheable=false)
    public static List<Map<String, Object>> getStorageList() {
        try {
            String apiUrl = BASE_URL + '/directory/search-full'
                + '?drawer_id=' + DRAWER_ID + '&skip=1&take=100&sort=ASC';

            HttpRequest req = new HttpRequest();
            req.setEndpoint(apiUrl);
            req.setMethod('GET');
            req.setHeader('X-Tenant-ID', TENANT_ID);
            req.setHeader('Authorization', BEARER_TOKEN);
            req.setHeader('Content-Type', 'application/json');

            HttpResponse res = new Http().send(req);
            if (res.getStatusCode() != 200) {
                throw new AuraHandledException('API Error: ' + res.getStatusCode() + ' - ' + res.getBody());
            }

            Map<String, Object> parsed  = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            Map<String, Object> payload = (Map<String, Object>) parsed.get('payload');
            List<Object> data           = (List<Object>) payload.get('data');

            List<Map<String, Object>> out = new List<Map<String, Object>>();
            for (Object o : data) out.add((Map<String, Object>) o);
            return out;
        } catch (Exception e) {
            throw new AuraHandledException('Exception in getStorageList: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=false)
    public static String deleteStorages(List<Integer> ids) {
        try {
            HttpRequest req = new HttpRequest();
            req.setEndpoint(BASE_URL + '/directory/delete-multiple');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-Tenant-ID', TENANT_ID);
            req.setHeader('Authorization', BEARER_TOKEN);
            req.setBody(JSON.serialize(new Map<String, Object>{ 'ids' => ids }));

            HttpResponse res = new Http().send(req);
            Integer sc = res.getStatusCode();
            if (sc == 200 || sc == 201 || sc == 204) return 'success';
            return 'error: ' + sc + ' - ' + res.getBody();
        } catch (Exception e) {
            throw new AuraHandledException('Error in deleteStorages: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=false)
    public static List<Map<String,Object>> getFilesByDirectory(Integer directoryId) {
        try {
            String apiUrl = BASE_URL + '/directory_file/directory?skip=1&id=' + directoryId + '&take=100';

            HttpRequest req = new HttpRequest();
            req.setEndpoint(apiUrl);
            req.setMethod('GET');
            req.setHeader('X-Tenant-ID', TENANT_ID);
            req.setHeader('Authorization', BEARER_TOKEN);

            HttpResponse res = new Http().send(req);
            if (res.getStatusCode() != 200) {
                throw new AuraHandledException('API Error ' + res.getStatusCode() + ': ' + res.getBody());
            }

            Map<String, Object> parsed = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            if (parsed == null || !parsed.containsKey('payload')) {
                throw new AuraHandledException('Malformed response: missing "payload".');
            }
            Map<String, Object> payload = (Map<String, Object>) parsed.get('payload');
            if (payload == null || !payload.containsKey('data')) {
                throw new AuraHandledException('Malformed response: missing "payload.data".');
            }

            List<Object> data = (List<Object>) payload.get('data');
            List<Map<String,Object>> out = new List<Map<String,Object>>();
            for (Object o : data) if (o instanceof Map<String, Object>) out.add((Map<String,Object>) o);
            return out;
        } catch (AuraHandledException ahe) {
            throw ahe;
        } catch (Exception e) {
            throw new AuraHandledException('Error in getFilesByDirectory: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=false)
    public static String getFileStream(Integer fileId) {
        try {
            HttpRequest req = new HttpRequest();
            req.setEndpoint(BASE_URL + '/directory_file/' + fileId + '/stream');
            req.setMethod('GET');
            req.setHeader('X-Tenant-ID', TENANT_ID);
            req.setHeader('Authorization', BEARER_TOKEN);

            HttpResponse res = new Http().send(req);
            if (res.getStatusCode() != 200) {
                throw new AuraHandledException('API Error: ' + res.getStatusCode() + ' - ' + res.getBody());
            }

            Map<String, Object> parsed  = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            Map<String, Object> payload = (Map<String, Object>) parsed.get('payload');
            if (payload == null || !payload.containsKey('file')) {
                throw new AuraHandledException('No "file" field found in payload.');
            }
            return String.valueOf(payload.get('file')); // base64 string
        } catch (Exception e) {
            throw new AuraHandledException('Error in getFileStream: ' + e.getMessage());
        }
    }
}
