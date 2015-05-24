/**
 * Created by sameer on 2/17/15.
 * -
 * This user event is responsible of filling in configuration data into read only fields.
 * -
 */
/**
 * Client class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var eBayItemListing = (function() {
    return {
        /**
         * User Event before load handler.
         * This methods sets data into the fields and also make some fields disabled if the record is in edit mode.
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, view, copy, print, email
         * @param {nlobjForm} form Current form
         * @param {nlobjRequest} request Request object
         * @returns {Void}
         */
        userEventBeforeLoad: function(type, form, request) {
            // gets data from request parameters.
            var id = request.getParameter('custparam_internalId'),
                image = request.getParameter('custparam_image'),
                price = request.getParameter('custparam_price'),
                title = request.getParameter('custparam_title'),
                description = request.getParameter('custparam_description'),
                postalCode = request.getParameter('custparam_postal_code'),
                country = request.getParameter('custparam_country'),
                currency = request.getParameter('custparam_currency'),
                storeId = request.getParameter('custparam_defaultstore');
            try {
                switch (type.toString()) {
                    // Create mode...
                    case 'create':
                    {
                        /*
                         Sets configuration / Item related data into the form.
                         */
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
                    // Edit mode....
                    case 'edit':
                    {
                        // In edit mode, we cannot change Listing type.. So disable the field.
                        nlapiSetFieldDisabled('custrecord_f3ebayitemlistingtype', true);
                        break;
                    }
                }
            } catch (ex) {
                nlapiLogExecution('ERROR', 'Error in setting fields on item listing record.');
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
function eBayItemListingUserEventBeforeLoad(type, form, request) {
    return eBayItemListing.userEventBeforeLoad(type, form, request);
}
