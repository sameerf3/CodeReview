/**
 * Created by sameer on 2/19/15.
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
 * eBayItemListing class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var eBayItemListing = (function() {
    return {
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Access mode: create, copy, edit
         * @returns {Void}
         */
        clientPageInit: function(type) {
            if (type.toString() === 'create' || type.toString() === 'edit') {
                window.onbeforeunload = function() {
                    setTimeout(function() {
                        window.close();
                    }, 300);

                }
                jQuery('#tbl_submitter, #tbl_secondary_cancel').parent().hide();
                jQuery('#tdbody_submitter, #tdbody_secondarysubmitter, #tdbody__cancel, #tdbody_secondary_cancel, #tbl__cancel').hide();
                jQuery('body').append("<div id='overlay' style='position: fixed;top: 0;left: 0;width: 100%;" +
                    "height: 100%;background-color: #000;filter: alpha(opacity=80);-moz-opacity: 0.8;-khtml-opacity: 0.8;opacity: .8;z-index: 10000;" +
                    " display: none;'>" +
                    "<div class='theText' style='color: #FFFFFF; font-size:20px; font-weight:700;" +
                    " margin-top:15%; margin-left: 40%;'> <br><br>Please Wait. Item being processed<br><br></div>" +
                    "</div>");
                /*var submitFunc = document.getElementById('main_form').onsubmit;
                 document.getElementById('main_form').onsubmit = function(event) {
                 jQuery("#overlay").fadeIn();
                 setTimeout(submitFunc, 300);
                 };*/
                if (nlapiGetFieldText('custrecord_f3ebayitemlistingtype') === 'Chinese') {
                    nlapiSetFieldDisabled('custrecord_f3ebayitemquantity', true);
                } else {
                    nlapiSetFieldDisabled('custrecord_f3ebayitemquantity', false);
                }
            }
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @returns {Boolean} True to continue save, false to abort save
         */
        clientSaveRecord: function() {


        },

        validateMandatoryFields: function() {
            var mandatoryFieldsList = [];
            mandatoryFieldsList.push('custrecord_f3ebaylistingtitle');
            mandatoryFieldsList.push('custrecord_f3ebaylistingdescription');
            mandatoryFieldsList.push('custrecord_f3ebaycategory');
            mandatoryFieldsList.push('custrecord_f3ebayitemprice');
            mandatoryFieldsList.push('custrecord_f3ebaycondition');
            mandatoryFieldsList.push('custrecord_f3ebaydispatchtimemax');
            mandatoryFieldsList.push('custrecord_f3ebaylistingduration');
            mandatoryFieldsList.push('custrecord_f3ebayitemlistingtype');
            mandatoryFieldsList.push('custrecord_f3ebaylistingpaymentmethod');
            mandatoryFieldsList.push('custrecord_f3ebayitemlistingtype');
            mandatoryFieldsList.push('custrecord_f3ebaylistingpaymentmethod');
            mandatoryFieldsList.push('custrecord_f3paypalemailaddress');
            mandatoryFieldsList.push('custrecordpostal');
            mandatoryFieldsList.push('custrecord_f3ebayitemquantity');
            mandatoryFieldsList.push('custrecord_f3returnsacceptedoption');
            mandatoryFieldsList.push('custrecord_f3shippingtype');
            mandatoryFieldsList.push('custrecord_f3shippingservicecost');
            if (nlapiGetFieldText('custrecord_f3returnsacceptedoption') === 'Returns Accepted') {
                mandatoryFieldsList.push('custrecord_f3refundoptioncodetype');
                mandatoryFieldsList.push('custrecord_f3returnswithinoption');
                mandatoryFieldsList.push('custrecord_f3returnpolicydescription');
                mandatoryFieldsList.push('custrecord_shippingcostpaidbyoption');
            }
            return this.validationHelper(mandatoryFieldsList);
        },
        /**
         *
         * @param fieldList
         * @returns {{}}
         */
        validationHelper: function(fieldList) {
            var res = {},
                flag = true,
                message = [];
            fieldList.forEach(function(a) {
                if (!!F3.Util.Utility.isBlankOrNull(nlapiGetFieldValue(a))) {
                    message.push(nlapiGetFieldLabel(a));
                    if (!!flag || flag === undefined) {
                        flag = false;
                    }
                }
                res.message = 'Please enter value(s) for: ' + message.join(', ');
                res.status = flag;
            });

            return res;
        },


        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @param {Number} linenum Optional line item number, starts from 1
         * @returns {Boolean} True to continue changing field value, false to abort value change
         */
        clientValidateField: function(type, name, linenum) {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @param {Number} linenum Optional line item number, starts from 1
         * @returns {Void}
         */
        clientFieldChanged: function(type, name, linenum) {
            switch (name) {
                case 'custrecord_f3ebayitemlistingtype':
                {
                    if (nlapiGetFieldText('custrecord_f3ebayitemlistingtype') === 'Chinese') {
                        nlapiSetFieldDisabled('custrecord_f3ebayitemquantity', true);
                        nlapiSetFieldValue('custrecord_f3ebayitemquantity', 1);
                    } else {
                        nlapiSetFieldDisabled('custrecord_f3ebayitemquantity', false);
                    }
                    break;
                }
                case 'custrecord_f3freeshipping':
                {
                    if (nlapiGetFieldValue('custrecord_f3freeshipping') === 'T') {
                        nlapiSetFieldValue('custrecord_f3shippingservicecost', '0');
                    }
                    break;
                }
            }

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @returns {Void}
         */
        clientPostSourcing: function(type, name) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Void}
         */
        clientLineInit: function(type) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to save line item, false to abort save
         */
        clientValidateLine: function(type) {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Void}
         */
        clientRecalc: function(type) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to continue line item insert, false to abort insert
         */
        clientValidateInsert: function(type) {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to continue line item delete, false to abort delete
         */
        clientValidateDelete: function(type) {

            return true;
        },
        customSaveHandler: function() {

            var nsObj = {},
                url,
                result,
                postData = {},
                validMandatoryObj = this.validateMandatoryFields();
            try {
                if (!!validMandatoryObj.status) {
                    jQuery('#overlay').fadeIn();

                    nsObj = this.fetchFieldsData(nsObj);
                    url = nlapiResolveURL('SUITELET', 'customscript_ebay_item_to_ebay_listing',
                        'customdeploy_ebay_item_to_ebay_listing');
                    postData.nsObj = nsObj;
                    jQuery.ajax({
                        type: "POST",
                        url: url,
                        data: JSON.stringify(postData),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        timeout: 45000
                    }).done(function(d) {
                        eBayItemListing.successFunction(result, d, nsObj);
                    }).fail(function(jqXHR, textStatus) {
                        jQuery('#overlay').fadeOut();
                        if (textStatus === 'timeout') {
                            alert('Request timeout');
                        } else {
                            alert(textStatus);
                            result = JSON.parse(jqXHR.responseText);
                        }

                    });
                    //result = JSON.parse(result.getBody());

                } else {
                    alert(validMandatoryObj.message);
                    return false;
                }
            } catch (exception) {
                alert(exception.toString());
                jQuery('#overlay').fadeOut();
            }
        },
        cancelItemListing: function() {
            window.close();
        },
        successFunction: function(result, d, nsObj) {
            result = d;
            if (!!result.verifyItemStatus && (!!result.addItemStatus || !!result.verifyItemStatus)) {
                if (!!result.addItemStatus) {
                    nlapiSetFieldValue('custrecord_f3ebayitemid', result.itemId);
                }
                jQuery('#overlay').fadeOut();
                switch (nsObj.callType) {
                    case 'add':
                    {
                        alert('eBay item listing successful');
                        break;
                    }
                    case 'revise':
                    {
                        alert('eBay item successfully updated.');
                        break;
                    }
                }
                nlapiSetFieldDisabled('custrecord_f3ebayitemquantity', false);
                document.getElementById('main_form').submit();
                //return true;
            } else {
                jQuery('#overlay').fadeOut();
                if (!result.verifyItemStatus) {
                    alert(result.verifyItemMessage);
                } else if (!result.addItemStatus) {
                    alert(result.addItemMessage);
                } else {
                    alert(result.reviseItemMessage);
                }
                return false;
            }
        },
        fetchFieldsData: function(nsObj) {
            nsObj.ErrorLanguage = 'en_US';
            nsObj.WarningLevel = 'High';
            nsObj.Title = nlapiGetFieldValue('custrecord_f3ebaylistingtitle');
            nsObj.Description = nlapiGetFieldValue('custrecord_f3ebaylistingdescription');
            nsObj.CategoryID = nlapiGetFieldValue('custrecord_f3ebaycategory');
            nsObj.StartPrice = nlapiGetFieldValue('custrecord_f3ebayitemprice');
            nsObj.CategoryMappingAllowed = true;
            nsObj.ConditionID = nlapiGetFieldValue('custrecord_f3ebaycondition');
            nsObj.Country = nlapiGetFieldValue('custrecord_f3country');
            nsObj.Currency = nlapiGetFieldValue('custrecord_f3currency');
            nsObj.DispatchTimeMax = nlapiGetFieldValue('custrecord_f3ebaydispatchtimemax');
            nsObj.ListingDuration = nlapiGetFieldValue('custrecord_f3ebaylistingduration');
            nsObj.ListingType = nlapiGetFieldValue('custrecord_f3ebayitemlistingtype');
            nsObj.PaymentMethods = nlapiGetFieldValue('custrecord_f3ebaylistingpaymentmethod');
            nsObj.PayPalEmailAddress = nlapiGetFieldValue('custrecord_f3paypalemailaddress');
            nsObj.PictureURL = nlapiGetFieldValue('custrecord_f3ebayitemimage');
            if (!!nsObj.PictureURL && nsObj.PictureURL.length > 0) {
                nsObj.PictureURL = window.location.origin + nsObj.PictureURL;
                nsObj.PictureURL = nsObj.PictureURL.replace('https', 'http');
            }
            nsObj.PostalCode = nlapiGetFieldValue('custrecordpostal');
            nsObj.Quantity = nlapiGetFieldValue('custrecord_f3ebayitemquantity');
            nsObj.ReturnsAcceptedOption = nlapiGetFieldValue('custrecord_f3returnsacceptedoption');
            nsObj.RefundOption = nlapiGetFieldValue('custrecord_f3refundoptioncodetype');
            nsObj.ReturnsWithinOption = nlapiGetFieldValue('custrecord_f3returnswithinoption');
            nsObj.RefundDescription = nlapiGetFieldValue('custrecord_f3returnpolicydescription');
            nsObj.FreeShipping = nlapiGetFieldValue('custrecord_f3freeshipping') === 'T';
            nsObj.ShippingCostPaidByOption = nlapiGetFieldText('custrecord_shippingcostpaidbyoption');
            nsObj.ShippingType = nlapiGetFieldValue('custrecord_f3shippingtype');
            nsObj.ShippingServicePriority = '1';
            nsObj.ShippingService = nlapiGetFieldValue('custrecord_f3shippingservice');
            nsObj.ShippingServiceCost = nlapiGetFieldValue('custrecord_f3shippingservicecost');
            nsObj.Site = 'US';
            nsObj.SKU = nlapiGetFieldValue('custrecord_ns_item');
            if (!!F3.Util.Utility.isBlankOrNull(nlapiGetFieldValue('custrecord_f3ebayitemid'))) {
                nsObj.callType = 'add';
            } else {
                nsObj.callType = 'revise';
                nsObj.ItemId = nlapiGetFieldValue('custrecord_f3ebayitemid');
            }
            return nsObj;
        }
    };
})();


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function eBayItemListingclientPageInit(type) {
    return eBayItemListing.clientPageInit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @returns {Boolean} True to continue save, false to abort save
 */
function eBayItemListingclientSaveRecord() {

    return eBayItemListing.clientSaveRecord();
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function eBayItemListingclientValidateField(type, name, linenum) {

    return eBayItemListing.clientValidateField(type, name, linenum);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function eBayItemListingclientFieldChanged(type, name, linenum) {
    return eBayItemListing.clientFieldChanged(type, name, linenum);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function eBayItemListingclientPostSourcing(type, name) {
    return eBayItemListing.clientPostSourcing(type, name);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function eBayItemListingclientLineInit(type) {
    return eBayItemListing.clientLineInit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function eBayItemListingclientValidateLine(type) {

    return eBayItemListing.clientValidateLine(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function eBayItemListingclientRecalc(type) {
    return eBayItemListing.clientRecalc(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function eBayItemListingclientValidateInsert(type) {

    return eBayItemListing.clientValidateInsert(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function eBayItemListingclientValidateDelete(type) {

    return eBayItemListing.clientValidateDelete(type);
}

function eBayItemListCustomSave() {
    return eBayItemListing.customSaveHandler();
}

function eBayCancelItemListing() {
    return eBayItemListing.cancelItemListing();
}