/**
 * Created by sameer on 2/19/15.
 * This Suitelet acts as a middleware.
 * It is responsible of sending data to model for item to be synced on eBay and for error handling
 *
 */
/**
 * eBayItemListingMiddleWare class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */
var eBayItemListingMiddleWare = (function() {
    return {
        /**
         * main method
         */
        main: function(request, response) {
            var result = {};
            switch (request.getMethod()) {

                /*
                Get Request is not supporterd.
                 */
                case 'GET':
                    result.result = false;
                    result.data = {};
                    result.data.err = "Unauthorized";
                    response.write(JSON.stringify(result));
                    break;
                /*
                Post request handler.
                 */
                case 'POST':
                    result = this.postRequestHandler(request);
                    response.write(JSON.stringify(result));
            }

        },
        /**
         * This method contains all logic implementation of most reqquest.
         * @param request
         * @returns {{}}
         */
        postRequestHandler: function(request) {
            try {
                var ebayItem = new EbayItemModel(),
                    nsObj,
                    eBayRespModel,
                    eBayAddItemResponse,
                    itemObject = {},
                    eBayReviseItemResponse,
                    callType,
                    record;
                nsObj = JSON.parse(request.getBody()).nsObj;
                nsObj = this.makeNetSuiteObject(nsObj);

                /* we only need call type for client use. So deleting it from NS Object JSON. */
                delete nsObj.callType;
                /* Passing data to eBay Model, that is responsible to put item on eBay Store. */
                ebayItem.loadData(nsObj);

                switch (callType) {
                    /* list new item to eBay. */
                    case 'add':
                    {
                        /* Item add verification call. Login Implemented by Shoaib. */
                        eBayRespModel = Ebay_Operations.AddItemVerification(ebayItem);
                        itemObject.verifyItemStatus = eBayRespModel.Status;

                        /* If verification passes, send actual call to be listed on eBay.*/
                        if (!!eBayRespModel.Status) {
                            eBayAddItemResponse = Ebay_Operations.AddItem(ebayItem);
                            itemObject.addItemStatus = eBayAddItemResponse.Status;
                            if (!!eBayAddItemResponse) {
                                itemObject.Status = eBayAddItemResponse.Status;
                                itemObject.itemId = eBayAddItemResponse.ItemID;
                            } else {
                                itemObject.addItemMessage = eBayAddItemResponse.Message;
                            }
                        } else {
                            itemObject.verifyItemMessage = eBayRespModel.Message;
                        }
                        break;
                    }
                    /* Revise/Update Item on eBay. */
                    case 'revise':
                    {
                        itemObject.verifyItemStatus = true;
                        eBayReviseItemResponse = Ebay_Operations.ReviseItem(ebayItem);
                        itemObject.reviseItemMessage = eBayReviseItemResponse.Status;
                        if (!!eBayReviseItemResponse) {
                            itemObject.Status = eBayReviseItemResponse.Status;
                        } else {
                            itemObject.reviseItemMessage = eBayReviseItemResponse.Message;
                        }
                        break;
                    }
                }
                return itemObject;
            } catch (e) {
                F3.Util.Utility.log('ERROR', 'Error in eBay Item listing.');
            }
        },
        /**
         * Make JSON to be send to Model.
         * @param nsObj
         * @returns {*}
         */
        makeNetSuiteObject : function (nsObj) {
            nsObj.CategoryID = nlapiLookupField('customrecord_ebay_itemlistingcategory',
                nsObj.CategoryID, 'custrecord_ebay');
            nsObj.ConditionID = nlapiLookupField('customrecord_ebayitemlistingcondition',
                nsObj.ConditionID, 'custrecord_ebayconditionid');
            nsObj.Country = nlapiLookupField('customrecord_ebayitemlistingcountry',
                nsObj.Country, 'custrecord_ebaycountryid');
            nsObj.Currency = nlapiLookupField('currency', nsObj.Currency, 'symbol');
            nsObj.ListingDuration = nlapiLookupField('customrecord_ebay_listing_duration',
                nsObj.ListingDuration, 'custrecord_listing_duration');
            nsObj.ListingType = nlapiLookupField('customrecord_ebay_listing_type',
                nsObj.ListingType, 'custrecord_ebay_listing_type');
            nsObj.PaymentMethods = nlapiLookupField('customrecord_ebay_payment_methods',
                nsObj.PaymentMethods, 'custrecord_ebay_payment');
            nsObj.ReturnsAcceptedOption = !F3.Util.Utility.isBlankOrNull(nsObj.ReturnsAcceptedOption) ?
                nlapiLookupField('customrecord_f3returnsacceptedoption',
                    nsObj.ReturnsAcceptedOption, 'custrecord_return_accepted_options') : '';
            nsObj.RefundOption = !F3.Util.Utility.isBlankOrNull(nsObj.RefundOption) ?
                nlapiLookupField('customrecord_f3refundoptioncodetype',
                    nsObj.RefundOption, 'custrecord_option_code_type') : '';
            nsObj.ReturnsWithinOption = !F3.Util.Utility.isBlankOrNull(nsObj.ReturnsWithinOption) ?
                nlapiLookupField('customrecord_f3returnsiwthinoption',
                    nsObj.ReturnsWithinOption, 'custrecord_return_within_option') : '';
            nsObj.ShippingType = nlapiLookupField('customrecord_ebay_shipping_type',
                nsObj.ShippingType, 'custrecord_shipping_type');
            nsObj.ShippingService = nlapiLookupField('customrecord_ebay_shipping_services',
                nsObj.ShippingService, 'custrecord_shipping_service');
            callType = nsObj.callType;
            record = nlapiLoadRecord('inventoryitem', nsObj.SKU);
            nsObj.SKU = record.getFieldValue('itemid');
            return nsObj;
        }
    };
})();

/**
 * This is the main entry point for eBayItemListingMiddleWare suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function eBayItemListingMiddleWareSuiteletMain(request, response) {
    return eBayItemListingMiddleWare.main(request, response);
}