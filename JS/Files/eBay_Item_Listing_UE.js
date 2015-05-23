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
var eBayItemListing = (function() {
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
        userEventBeforeLoad: function(type, form, request) {
            var id = request.getParameter('custparam_internalId'),
                image = request.getParameter('custparam_image'),
                price = request.getParameter('custparam_price'),
                title = request.getParameter('custparam_title'),
                description = request.getParameter('custparam_description'),
                postalCode = request.getParameter('custparam_postal_code'),
                country = request.getParameter('custparam_country'),
                currency = request.getParameter('custparam_currency'),
                storeId = request.getParameter('custparam_defaultstore');
            switch (type.toString()) {
                case 'create':
                {
                    nlapiSetFieldValue('custrecord_ns_item', id);
                    nlapiSetFieldValue('custrecord_f3ebayitemimage', image);
                    nlapiSetFieldValue('custrecord_f3ebayitemprice', price);
                    nlapiSetFieldValue('custrecord_f3ebaylistingtitle', title);
                    nlapiSetFieldValue('custrecord_f3ebaylistingdescription', description);
                    nlapiSetFieldValue('custrecordpostal', postalCode);
                    nlapiSetFieldValue('custrecord_f3country', country);
                    nlapiSetFieldValue('custrecord_f3currency', currency);
                    nlapiSetFieldValue('custrecord_f3ebaystore', storeId);
                    break;
                }
                case 'edit':
                {
                    /**
                     * Check if the store is same or not
                     * If same store Edit the eBay Listing
                     * If Different store, Clear eBay Item ID and add new eBay Listing.
                     */
                    nlapiSetFieldDisabled('custrecord_f3ebayitemlistingtype', true);
                    /*var rec, filters = [];
                     filters.push(new nlobjSearchFilter('custrecord_default_settings', '', 'is', 'T'));
                     rec =  nlapiSearchRecord('customrecord_configurationrecord', '', filters);
                     if(!!rec && rec.length > 0) {
                     rec = rec[0];
                     if(rec.getId() !== nlapiGetFieldValue('custrecord_f3ebaystore')) {
                     nlapiSetFieldValue('custrecord_f3ebayitemid', '');
                     nlapiSetFieldValue('custrecord_f3ebaystore', rec.getId());
                     }
                     } else {
                     nlapiSetFieldDisabled('custrecord_f3ebayitemlistingtype', 'true');
                     }*/
                    break;
                }
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
        userEventBeforeSubmit: function(type) {
            throw new Error('Invalid Name');
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
        userEventAfterSubmit: function(type) {
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
function eBayItemListingUserEventBeforeLoad(type, form, request) {
    return eBayItemListing.userEventBeforeLoad(type, form, request);
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
function eBayItemListingUserEventBeforeSubmit(type) {
    return eBayItemListing.userEventBeforeSubmit(type);
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
function eBayItemListingUserEventAfterSubmit(type) {
    return eBayItemListing.userEventAfterSubmit(type);
}