'use strict'
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var HookMgr = require('dw/system/HookMgr');
var Logger = require('dw/system/Logger');
var Transaction = require('dw/system/Transaction');

/**
 *
 * @name Custom/contactUs-SaveCustomerResponses - save the submitted customer response
 * @function {sendResponseMails} - sending Mails to the specific department
 */
function sendResponsesMails() {
    var Mail = require('dw/net/Mail');
    try {
        var contactUsResponsesObj = null;
        Transaction.wrap(function () {
            contactUsResponsesObj = CustomObjectMgr.getAllCustomObjects('contactUsResponsesUmesh');
            while (contactUsResponsesObj.hasNext()) {
                var newItem = contactUsResponsesObj.next();
                var status = HookMgr.callHook('custom.hook.sendEmail', 'sendEmail', newItem.custom, 'custom')
                if (status === true) {
                    try {
                        Transaction.wrap(function () {
                            CustomObjectMgr.remove(newItem);
                        });
                    }
                    catch (error) {
                        Logger.debug(error);
                    }
                }
            }
        });
    }
    catch (error) {
        Logger.error(error)
    }
}
module.exports = {
    sendResponsesMails: sendResponsesMails
}