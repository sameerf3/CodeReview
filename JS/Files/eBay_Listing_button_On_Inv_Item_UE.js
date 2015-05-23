/**
 * Created by sameer on 2/17/15.
 * TODO:
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */

/**
 * WotpClient class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var eBayListingButton = (function () {
    return {
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, view, copy, print, email
         * @param {nlobjForm} form Current form
         * @param {nlobjRequest} request Request object
         * @returns {Void}
         */
        userEventBeforeLoad: function (type, form, request) {
            if (type.toString() === 'view') {
                //var printAllLines = 'window.open(\'/app/accounting/print/hotprint.nl?regular=T&sethotprinter=T&template=162&id=' + nlapiGetRecordId() + '&label=Quote&printtype=transaction&trantype=estimate\',\'newwin\',width=1200,height=750,menubar=1,resizeable=1,scrollbars=1);'
                var url,
                    listingSuitelet,
                    description = nlapiGetFieldValue('displayname') ? nlapiGetFieldValue('displayname') : nlapiGetFieldValue('itemid');
                url = "/app/site/hosting/scriptlet.nl?script=77&deploy=1&itemid=" + nlapiGetRecordId() +
                    "&itemprice=" + encodeURI(nlapiGetFieldValue('price')) +
                    "&title=" + encodeURI(nlapiGetFieldValue('itemid')) +
                    "&description=" + encodeURI(description) +
                    "&imageid=" + nlapiGetFieldValue('storedisplaythumbnail');
                listingSuitelet = "window.open('" + url + "' , '_blank', 'width=800, height=600, top=200, left=300')"
                form.addButton('custpage_listingsuitelet', 'eBay Item Listing', listingSuitelet);
            }
        },
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, delete, xedit
         *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
         *                      pack, ship (IF)
         *                      markcomplete (Call, Task)
         *                      reassign (Case)
         *                      editforecast (Opp, Estimate)
         * @returns {Void}
         */
        userEventBeforeSubmit: function (type) {
            //TODO: Write Your code here
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, delete, xedit,
         *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
         *                      pack, ship (IF only)
         *                      dropship, specialorder, orderitems (PO only)
         *                      paybills (vendor payments)
         * @returns {Void}
         */
        userEventAfterSubmit: function (type) {
            //TODO: Write Your code here
        }
    };
})();

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function eBayListingButtonUserEventBeforeLoad(type, form, request) {
    return eBayListingButton.userEventBeforeLoad(type, form, request);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function eBayListingButtonUserEventBeforeSubmit(type) {
    return eBayListingButton.userEventBeforeSubmit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only)
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function eBayListingButtonUserEventAfterSubmit(type) {
    return eBayListingButton.userEventAfterSubmit(type);
}