/**
 * Created by sameer on 2/17/15.
 * -
 * This file is responsible of redirecting flow from Item page to Item Listing Record Type.
 * If Item is not listed on eBay, a new record page will be open
 * If Item exists on eBay, That record will be opened.
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
                case 'GET': {
                    this.getRequestHandler(form, request);
                    form.addSubmitButton('Submit');
                    break;
                }
                default : {
                    break;
                }
            }
            response.writePage(form);
        },

        /**
         * Handle Get Request
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
                params = {},
                configRecord;
            try {
                id = request.getParameter('itemid');
                record = this.getListingRecord(id);
                /* If record exists, redirect the browser to that record. */
                if (!!record && record.length > 0) {
                    for (var i = 0; i < record.length; i++) {
                        if (record[i].getValue('custrecord_f3ebaystore') === configRecord.getId()) {
                            nlapiSetRedirectURL('record', 'customrecord_ebayitemlisting', record[i].getId(), 'edit');
                        }
                    }
                } /* else redirect browser to new record with data */
                else {
                    price = request.getParameter('itemprice');
                    title = request.getParameter('title');
                    description = request.getParameter('description');
                    image = request.getParameter('imageid');
                    if (!!image && image !== 'null' && image.length > 0) {
                        image = nlapiLoadFile(image);
                        imageUrl = image.getURL();
                    }
                    configRecord = this.getConfigurationRecord();
                    if (!!configRecord && configRecord.length > 0) {
                        configRecord = configRecord[0];
                    }
                    // creating parameters for for sending to new eBay item listing record.
                    params.custparam_internalId = id;
                    params.custparam_price = price;
                    params.custparam_image = imageUrl;
                    params.custparam_title = title;
                    params.custparam_description = description;
                    params.custparam_postal_code = !!configRecord ? configRecord.getValue('custrecord_postal_code') : '';
                    params.custparam_currency = !!configRecord ? configRecord.getValue('custrecord_currency') : '';
                    params.custparam_priceLevel = !!configRecord ? configRecord.getValue('custrecord_price_level') : '';
                    params.custparam_country = !!configRecord ? configRecord.getValue('custrecord_country') : '';
                    params.custparam_defaultstore = !!configRecord ? configRecord.getId() : '';
                    nlapiSetRedirectURL('record', 'customrecord_ebayitemlisting', null, null, params);
                }
            } catch (exception) {
                F3.Util.Utility.log('ERROR', 'Error', exception);
            }
        },
        /**
         * Gets configuration setting of eBay Connector.
         * @returns {*}
         */
        getConfigurationRecord : function () {
            var filters = [],
                columns = [],
                configRecord;
            filters.push(new nlobjSearchFilter('custrecord_default_settings', '', 'is', 'T'));
            columns.push(new nlobjSearchColumn('custrecord_postal_code'));
            columns.push(new nlobjSearchColumn('custrecord_price_level'));
            columns.push(new nlobjSearchColumn('custrecord_currency'));
            columns.push(new nlobjSearchColumn('custrecord_country'));
            configRecord = nlapiSearchRecord('customrecord_configurationrecord', '', filters, columns);
            return configRecord;
        },

        /**
         * Gets eBay listing record of given ID.
         * @param id
         * @returns {*}
         */
        getListingRecord: function (id) {
            var filters = [],
                columns = [],
                record;
            filters.push(new nlobjSearchFilter('custrecord_ns_item', '', 'is', id));
            filters.push(new nlobjSearchFilter('isinactive', '', 'is', 'F'));
            columns.push(new nlobjSearchColumn('custrecord_f3ebaystore'));
            record = nlapiSearchRecord('customrecord_ebayitemlisting', '', filters, columns);
            return record;
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