var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var myservice = require('/cloudkicks_ashutosh/cartridge/static/serviceStatucValue/staticKey.js')


var umeshOcapiService = LocalServiceRegistry.createService("umeshOcapi",{
createRequest: function(svc,param){
    svc.setRequestMethod('POST');
    svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');
    svc.addHeader('Authorization', 'Basic dW1lc2gubmFtZGV2QGNvZGVzcXVhcmV0ZWNoLmNvbTpQZWVsdXBhdG9kaUAxMjM6Y29kZXNxdWFyZTIwMjI=');

    return param;
    },

    parseResponse: function(svc,httpClient) {
        var result ;
        try {
            result = JSON.parse(httpClient.text)

        } catch (error) {
            result = httpClient.text

        }
        return result
    }
}
);

module.exports = {
    umeshOcapiService:umeshOcapiService
}