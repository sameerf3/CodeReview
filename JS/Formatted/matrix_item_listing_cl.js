/**
 * Created by sameer on 3/10/15.
 * TODO:
 * -
 * -
 * -
 */
/**
 * matrixItemListing class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var matrixItemListing = (function() {
    return {
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Access mode: create, copy, edit
         * @returns {Void}
         */
        clientPageInit: function(type) {
            'use strict';
            //to reselect checked boxes.
            jQuery('[id^="custpage_select_child"] input:checked').click().click();

        },

        /**
         * This method checks if any child is selected or whether quantity or price field is empty or not.
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         * @returns {Boolean} True to continue save, false to abort save
         */
        clientSaveRecord: function() {
            'use strict';
            //To check if if at least one line selected.
            //Also to check whether quantity and Price are not empty.
            var lineNumber, flag = true,
                count, selectedLineCount = 0;
            count = nlapiGetLineItemCount('child_list');
            for (lineNumber = 1; lineNumber <= count; lineNumber++) {
                if (nlapiGetLineItemValue('child_list', 'custpage_select_child', lineNumber) === 'T') {
                    selectedLineCount += 1;
                    if (!nlapiGetLineItemValue('child_list', 'custpage_child_price', lineNumber) ||
                        !nlapiGetLineItemValue('child_list', 'custpage_child_quantity', lineNumber)) {
                        flag = false;
                    }
                }
            }
            if (!flag) {
                alert('Quantity and Price are mandatory field.');
            }
            if (selectedLineCount === 0) {
                alert('Please select at least one child.');
                flag = false;
            }
            return !!flag;

        },

        /**
         * Select check box if both quantity and price are filled of current line item and de-select
         * if any of the two are empty
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @param {Number} linenum Optional line item number, starts from 1
         * @returns {Void}
         */
        clientFieldChanged: function(type, name, linenum) {
            'use strict';
            if (type === eBayItemListingDao.SUBLIST.childSelectionSubList) {
                switch (name) {
                    case eBayItemListingDao.CHILD_SELECTION_ITEMS.price:
                    case eBayItemListingDao.CHILD_SELECTION_ITEMS.quantity:
                    {
                        if (F3.Util.Utility.isBlankOrNull(nlapiGetLineItemValue(
                                type,
                                eBayItemListingDao.CHILD_SELECTION_ITEMS.price, linenum)) ||
                            F3.Util.Utility.isBlankOrNull(nlapiGetLineItemValue(
                                type,
                                eBayItemListingDao.CHILD_SELECTION_ITEMS.quantity, linenum))) {
                            nlapiSetLineItemValue(type, eBayItemListingDao.CHILD_SELECTION_ITEMS.select, linenum, 'F');
                        } else {
                            nlapiSetLineItemValue(type, eBayItemListingDao.CHILD_SELECTION_ITEMS.select, linenum, 'T');
                        }
                        break;
                    }
                }

            }
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
function matrixItemListingclientPageInit(type) {
    return matrixItemListing.clientPageInit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @returns {Boolean} True to continue save, false to abort save
 */
function matrixItemListingclientSaveRecord() {
    return matrixItemListing.clientSaveRecord();
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
function matrixItemListingclientFieldChanged(type, name, linenum) {
    return matrixItemListing.clientFieldChanged(type, name, linenum);
}