var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var myservice = require('/cloudkicks_ashutosh/cartridge/static/serviceStatucValue/staticKey.js')


var dadJokeApi = LocalServiceRegistry.createService(myservice.umeshnamdevApi,{
createRequest: function(svc,param){
    svc.setRequestMethod('GET');
    svc.addHeader('Accept', 'application/json');

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
    umeshJokeAPI:dadJokeApi
}