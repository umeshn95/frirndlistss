var Status = require('dw/system/Status');
var URLUtils = require('dw/web/URLUtils');

function onRequest() {
	if (request.httpRequest && !request.includeRequest) {
		if (request.httpQueryString.match(/magic=true/ig)) {
			response.redirect(URLUtils.url('ServiceUmesh-Expose'));
		}
	}

	return new Status(Status.OK);
}

module.exports = {
    onRequest: onRequest
};