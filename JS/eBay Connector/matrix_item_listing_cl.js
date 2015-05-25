/**
 * Created by sameer on 3/10/15.
 * TODO:
 * -
 * Client Script on Matrix Item selection page.
 * -
 */


/**
 * matrixItemListing class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var matrixItemListing = (function() {
    return {
        /**
         * This Method only checks the selected child again when coming back from item listing record type.
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Access mode: create, copy, edit
         * @returns {Void}
         */
        clientPageInit: function(type) {
            'use strict';
            //hack: to reselect checked boxes on coming back to matrix child selection page..
            jQuery('[id^="custpage_select_child"] input:checked').click().click();
        },

        /**
         * Runs before navigating to item listing record. This method is responsible of checking if at least
         * one child is selected.
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
                            /* If price and quantity are null, then automatically deselect this child. */
                            nlapiSetLineItemValue(type, eBayItemListingDao.CHILD_SELECTION_ITEMS.select, linenum, 'F');
                        } else {
                            /* If price and quantity are not null, then automatically select this child. */
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