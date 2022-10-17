'use strict';

/**
 * @namespace Address
 */

var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

/**
 * Creates a list of address model for the logged in user
 * @param {string} customerNo - customer number of the current customer
 * @returns {List} a plain list of objects of the current customer's addresses
 */
function getList(customerNo) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var AddressModel = require('*/cartridge/models/address');
    var collections = require('*/cartridge/scripts/util/collections');

    var customer = CustomerMgr.getCustomerByCustomerNumber(customerNo);
    var rawAddressBook = customer.addressBook.getAddresses();
    var addressBook = collections.map(rawAddressBook, function (rawAddress) {
        var addressModel = new AddressModel(rawAddress);
        addressModel.address.UUID = rawAddress.UUID;
        return addressModel;
    });
    return addressBook;
}

/**
 * Address-List : Used to show a list of address created by a registered shopper
 * @name Base/Address-List
 * @function
 * @memberof Address
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('List', userLoggedIn.validateLoggedIn, consentTracking.consent, function (req, res, next) {
    var Transaction = require('dw/system/Transaction');
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var Lis;
    var Tis;
    var ProductList = require('dw/customer/ProductList');
       Transaction.wrap(()=>{
          Tis = ProductListMgr.getProductLists(customer,100);
            Lis = Tis[0].items
       })

    var actionUrls = {
        deleteActionUrl: URLUtils.url('AddFriend-DeleteAddress').toString(),
        listActionUrl: URLUtils.url('AddFriend-List').toString()
    };

    res.render('account/friendBook', {
        addressBook: Lis,
        actionUrls: actionUrls,
        breadcrumbs: [
            {
                htmlValue: Resource.msg('global.home', 'common', null),
                url: URLUtils.home().toString()
            },
            {
                htmlValue: Resource.msg('page.title.myaccount', 'account', null),
                url: URLUtils.url('Account-Show').toString()
            }
        ]
    });
    next();
});

/**
 * Address-AddAddress : A link to a page to create a new address
 * @name Base/Address-AddAddress
 * @function
 * @memberof Address
 * @param {middleware} - csrfProtection.generateToken
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get(
    'AddFriendData',
    csrfProtection.generateToken,
    consentTracking.consent,
    userLoggedIn.validateLoggedIn,
    function (req, res, next) {
        var FriendDataForm = server.forms.getForm('friendlist');
        FriendDataForm.clear();
        res.render('account/editFriendsData', {
            FriendDataForm: FriendDataForm,
            breadcrumbs: [
                {
                    htmlValue: Resource.msg('global.home', 'common', null),
                    url: URLUtils.home().toString()
                },
                {
                    htmlValue: Resource.msg('page.title.myaccount', 'account', null),
                    url: URLUtils.url('AddFriend-Show').toString()
                },
                {
                    htmlValue: Resource.msg('label.addressbook', 'account', null),
                    url: URLUtils.url('AddFriend-List').toString()
                }
            ]
        });
        next();
    }
);

/**
 * Address-EditAddress : A link to edit and existing address
 * @name Base/Address-EditAddress
 * @function
 * @memberof Address
 * @param {middleware} - csrfProtection.generateToken
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - addressId - a string used to identify the address record
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get(
    'EditAddress',
    csrfProtection.generateToken,
    userLoggedIn.validateLoggedIn,
    consentTracking.consent,
    function (req, res, next) {
        var ProductListMgr = require('dw/customer/ProductListMgr');
        var addressId = req.querystring.addressId;
        var addressForm = server.forms.getForm('friendlist');
            var updateFriendList = ProductListMgr.getProductLists(customer,100);

            updateFriendList=  updateFriendList[0].getItem(addressId);


        addressForm.copyFrom({
            name:updateFriendList.custom.friendNameU,
            date:updateFriendList.custom.friendDobU,
            phone:updateFriendList.custom.friendPhoneU,
            nickname:updateFriendList.custom.friendNicknameU
        });

        res.render('account/editFriendsData', {
            FriendDataForm: addressForm,
            addressId: addressId,
            breadcrumbs: [
                {
                    htmlValue: Resource.msg('global.home', 'common', null),
                    url: URLUtils.home().toString()
                },
                {
                    htmlValue: Resource.msg('page.title.myaccount', 'account', null),
                    url: URLUtils.url('Account-Show').toString()
                },
                {
                    htmlValue: Resource.msg('label.addressbook', 'account', null),
                    url: URLUtils.url('Address-List').toString()
                }
            ]
        });

        next();
    }
);

/**
 * Address-SaveAddress : Save a new or existing address
 * @name Base/Address-SaveAddress
 * @function
 * @memberof Address
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {querystringparameter} - addressId - a string used to identify the address record
 * @param {httpparameter} - dwfrm_address_addressId - An existing address id (unless new record)
 * @param {httpparameter} - dwfrm_address_firstName - A person’s first name
 * @param {httpparameter} - dwfrm_address_lastName - A person’s last name
 * @param {httpparameter} - dwfrm_address_address1 - A person’s street name
 * @param {httpparameter} - dwfrm_address_address2 -  A person’s apartment number
 * @param {httpparameter} - dwfrm_address_country - A person’s country
 * @param {httpparameter} - dwfrm_address_states_stateCode - A person’s state
 * @param {httpparameter} - dwfrm_address_city - A person’s city
 * @param {httpparameter} - dwfrm_address_postalCode - A person’s united states postel code
 * @param {httpparameter} - dwfrm_address_phone - A person’s phone number
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post('SaveFriend', csrfProtection.validateAjaxRequest, function (req, res, next) {
    var Transaction = require('dw/system/Transaction');
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var ProductMgr = require('dw/catalog/ProductMgr');
    var addressForm = server.forms.getForm('friendlist');
    var addressFormObj = addressForm.toObject();
    addressFormObj.addressForm = addressForm;

    var setFriendEdit = ProductListMgr.getProductLists(customer,100);
   
if(setFriendEdit.length == 0 || !setFriendEdit)    
{
       Transaction.wrap(function () {
        var friendProductData = ProductMgr.getProduct("friendProduct");
        var friendDataList = ProductListMgr.createProductList(customer,100);
    var mmm =   friendDataList.createProductItem(friendProductData);
    mmm.custom.friendNameU = addressFormObj.name;
    mmm.custom.friendDobU = addressFormObj.date;
    mmm.custom.friendPhoneU = addressFormObj.phone;
    mmm.custom.friendNicknameU = addressFormObj.nickname;

         });
}
else{
    if (req.querystring.addressId) {

        Transaction.wrap(function () {
           setFriendEdit= setFriendEdit[0].getItem(req.querystring.addressId)

        setFriendEdit.custom.friendNameU=addressFormObj.name;
        setFriendEdit.custom.friendDobU =addressFormObj.date;
        setFriendEdit.custom.friendPhoneU= addressFormObj.phone;
        setFriendEdit.custom.friendPhoneU = addressFormObj.nickname;

        });
    }
        else{
            Transaction.wrap(function () {
                var friendProductData = ProductMgr.getProduct("friendProduct");
              var friendItems = setFriendEdit[0].createProductItem(friendProductData);
            //    var friendItems =  setFriendEdit[0].getItems()
               friendItems.custom.friendNameU = addressFormObj.name;
               friendItems.custom.friendDobU = addressFormObj.date;
               friendItems.custom.friendPhoneU = addressFormObj.phone;
               friendItems.custom.friendNicknameU = addressFormObj.nickname;
        
                });
        }

     
}

    // if (req.querystring.addressId) {

    //     Transaction.wrap(function () {
    //         var setFriendEdit = ProductListMgr.getProductList(req.querystring.addressId);

    //     setFriendEdit.custom.friendName=addressFormObj.name;
    //     setFriendEdit.custom.friendDOB =addressFormObj.date;
    //     setFriendEdit.custom.friendPhone= addressFormObj.phone;
    //     setFriendEdit.custom.friendPhone = addressFormObj.nickname;

    //     });
    // }else{
    //     Transaction.wrap(function () {
    //         var friendData = ProductListMgr.createProductList(customer,100)
    //        friendData.custom.friendName = addressFormObj.name;
    //        friendData.custom.friendDOB = addressFormObj.date;
    //        friendData.custom.friendPhone = addressFormObj.phone;
    //        friendData.custom.friendNickname = addressFormObj.nickname;

    //     });
    // }
    
    res.redirect(URLUtils.url('AddFriend-List'))
     next();
});

/**
 * Address-DeleteAddress : Delete an existing address
 * @name Base/Address-DeleteAddress
 * @function
 * @memberof Address
 * @param {middleware} - userLoggedIn.validateLoggedInAjax
 * @param {querystringparameter} - addressId - a string used to identify the address record
 * @param {querystringparameter} - isDefault - true if this is the default address. false otherwise
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.get('DeleteAddress', userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var addressId = req.querystring.addressId;
    var setFriendEdit = ProductListMgr.getProductLists(customer,100);
   
//    var friendlistToRemo = ProductListMgr.getProductList(addressId)
    Transaction.wrap(()=>{

setFriendEdit[0].removeItem(setFriendEdit[0].getItem(addressId));

    })
    
     next();
});

/**
 * Address-SetDefault : Set an address to be the default address
 * @name Base/Address-SetDefault
 * @function
 * @memberof Address
 * @param {middleware} - userLoggedIn.validateLoggedIn
 * @param {querystringparameter} - addressId - a string used to identify the address record
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
server.get('SetDefault', userLoggedIn.validateLoggedIn, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');

    var addressId = req.querystring.addressId;
    var customer = CustomerMgr.getCustomerByCustomerNumber(
        req.currentCustomer.profile.customerNo
    );
    var addressBook = customer.getProfile().getAddressBook();
    var address = addressBook.getAddress(addressId);
    this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
        Transaction.wrap(function () {
            addressBook.setPreferredAddress(address);
        });

        // Send account edited email
        accountHelpers.sendAccountEditedEmail(customer.profile);

        res.redirect(URLUtils.url('Address-List'));
    });
    next();
});

/**
 * Address-Header : The endpoint Address-Header renders an isml
 * @name Base/Address-Header
 * @function
 * @memberof Address
 * @param {middleware} - server.middleware.include
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Header', server.middleware.include, function (req, res, next) {
    if (!req.currentCustomer.profile) {
        res.render('account/header-anon', {});
    } else {
        res.render('account/header-logged', { name: req.currentCustomer.profile.firstName });
    }
    next();
});

module.exports = server.exports();
