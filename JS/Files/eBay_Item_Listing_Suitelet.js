/**
 * Created by sameer on 2/17/15.
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */
/**
 * eBayItemListing class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */
var eBayItemListing = (function() {
    return {
        /**
         * main method
         */
        main: function(request, response) {
            var form = nlapiCreateForm('eBay Items Listing');
            switch (request.getMethod()) {

                case 'GET':
                {
                    this.getRequestHandler(form, request);
                    form.addSubmitButton('Submit');
                    break;
                }

                case 'POST':
                {
                    this.postRequestHandler(form);
                    break;
                }
            }
            response.writePage(form);
        },

        /**
         *
         * @param form
         * @param request
         */
        getRequestHandler: function(form, request) {
            var id,
                record,
                price,
                title,
                description,
                image,
                imageUrl,
                columns = [],
                filters = [],
                params = {},
                postalCode,
                currency,
                country,
                priceLevel,
                configRecord,
                storeId;
            try {
                filters.push(new nlobjSearchFilter('custrecord_default_settings', '', 'is', 'T'));
                columns.push(new nlobjSearchColumn('custrecord_postal_code'));
                columns.push(new nlobjSearchColumn('custrecord_price_level'));
                columns.push(new nlobjSearchColumn('custrecord_currency'));
                columns.push(new nlobjSearchColumn('custrecord_country'));
                configRecord = nlapiSearchRecord('customrecord_configurationrecord', '', filters, columns);
                if (!!configRecord && configRecord.length > 0) {
                    configRecord = configRecord[0];
                    priceLevel = configRecord.getValue('custrecord_price_level');
                    currency = configRecord.getValue('custrecord_currency');
                    postalCode = configRecord.getValue('custrecord_postal_code');
                    country = configRecord.getValue('custrecord_country');
                    storeId = configRecord.getId();
                }
                filters = [];
                columns = [];
                id = request.getParameter('itemid');
                price = request.getParameter('itemprice');
                title = request.getParameter('title');
                description = request.getParameter('description');
                image = request.getParameter('imageid');
                if (!!image && image !== 'null' && image.length > 0) {
                    image = nlapiLoadFile(image);
                    imageUrl = image.getURL();
                }
                filters.push(new nlobjSearchFilter('custrecord_ns_item', '', 'is', id));
                filters.push(new nlobjSearchFilter('isinactive', '', 'is', 'F'));
                columns.push(new nlobjSearchColumn('custrecord_f3ebaystore'));
                record = nlapiSearchRecord('customrecord_ebayitemlisting', '', filters, columns);
                if (!!record && record.length > 0) {
                    for (var i = 0; i < record.length; i++) {
                        if (record[i].getValue('custrecord_f3ebaystore') === configRecord.getId()) {
                            nlapiSetRedirectURL('record', 'customrecord_ebayitemlisting', record[i].getId(), 'edit');
                        }
                    }
                } else {
                    params.custparam_internalId = id;
                    params.custparam_price = price;
                    params.custparam_image = imageUrl;
                    params.custparam_title = title;
                    params.custparam_description = description;
                    params.custparam_postal_code = postalCode;
                    params.custparam_currency = currency;
                    params.custparam_priceLevel = priceLevel;
                    params.custparam_country = country;
                    params.custparam_defaultstore = storeId;
                    nlapiSetRedirectURL('record', 'customrecord_ebayitemlisting', null, null, params);
                }
            } catch (exception) {
                F3.Util.Utility.log('ERROR', 'Error', exception);
            }
        },

        /**
         * @param form
         */
        postRequestHandler: function(form) {
            form.addField('custpage_ebay', 'text', '').setDefaultValue('Post page');
        }
    };
})();

/**
 * This is the main entry point for eBayItemListing suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function eBayItemListingSuiteletMain(request, response) {
    return eBayItemListing.main(request, response);
}