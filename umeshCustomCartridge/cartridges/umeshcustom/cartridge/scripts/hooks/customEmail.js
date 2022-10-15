'use strict';
var Logger = require('dw/system/Logger');
/**
 *
 * @name Hook  - sends email
 * @function {sendEmail} - sending Mails to the specific department
 * @object {emailObject}
 */
function sendEmail(emailObj,emailObjType) {
        var mail: Mail = new dw.net.Mail();
        mail.addTo(emailObj.sendToEmailsUmesh);
        mail.setFrom(emailObj.customerEmailUmesh);
        mail.setSubject(emailObj.customerEmailUmesh);
        mail.setContent(emailObj.messageTextUmesh);
        var status = mail.send();
        if (status.getMessage() == 'OK') {
            return true;
        }
        else {
            return false;
        }
}
module.exports = {
    sendEmail: sendEmail
}