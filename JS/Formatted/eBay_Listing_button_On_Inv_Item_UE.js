/**
 * Created by sameer on 2/17/15.
 * - This is user event which is responsible for adding a button on Items
 */


/**
 *
 * Client class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var eBayListingButton = (function() {
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
        userEventBeforeLoad: function(type, form) {
            try {
                if (type.toString() === 'view') {
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
            } catch (e) {
                nlapiLogExecution('ERROR', 'Error in Adding button on item page.')
            }
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