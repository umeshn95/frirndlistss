importPackage(dw.object);

var Transaction = require("dw/system/Transaction");
var CustomObjectMgr = require("dw/object/CustomObjectMgr");
var Logger = require("dw/system/Logger");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
    "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"
);



function sendResponsesMails() {
    var Mail = require("dw/net/Mail");
    try {
        var contactUsResponsesObj = null;
        var returnResponsesArr = [];
        var email = new Mail();
        Transaction.wrap(function () {
            contactUsResponsesObj =
                CustomObjectMgr.getAllCustomObjects("contactUsResponses");
            while (contactUsResponsesObj.hasNext()) {
                var newItem = contactUsResponsesObj.next();

                if (newItem.custom.status == "pending") {
                    returnResponsesArr.push(newItem);
                }
            }
        });

        returnResponsesArr.forEach((element) => {
            Logger.debug("start_salesforcemail");
            var mail: Mail = new dw.net.Mail();
            mail.addTo(element.custom.sendToEmails);
            mail.setFrom(element.custom.customerEmail);
            mail.setSubject(element.custom.customerEmail);
            mail.setContent(element.custom.messageText);
            var status = mail.send();

            Logger.debug("start_sendgridmail");

            const msg = {
                to: element.custom.sendToEmails, // Change to your recipient
                from: element.custom.customerEmail, // Change to your verified sender
                subject: "Sending with SendGrid is Fun",
                text: element.custom.messageText,
            };
            sgMail
    .send(msg)
    .then((response) => {
        Logger.debug(response[0].statusCode);

        // console.log(response[0].statusCode);
        // console.log(response[0].headers);
    })
    .catch((error) => {
        Logger.debug(error);
    });

            if (status.getMessage() == "OK") {
                try {
                    Transaction.wrap(function () {
                        CustomObjectMgr.remove(element);
                    });
                } catch (error) {
                    Logger.debug(error);
                }
            } else {
                Logger.debug(status.isError());
            }
            Logger.debug(status.getMessage());
        });
    } catch (error) {
        Logger.debug(error);
    }
}

module.exports = {
    sendResponsesMails: sendResponsesMails,
};
