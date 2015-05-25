/**
 * Created by sameer on 5/25/15.
 * -
 * This script is for one time run only.
 * This scheduled scripts update all the old Purchase order with missing Palets fields
 * -
 */
/**
 * updateOldPo class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */
var updateOldPo = (function () {
    return {
        /**
         * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
         * @returns {Void}
         */
        scheduled: function (type) {
            try {
                var iteratorI,
                    records,
                    iteratorJ,
                    rec,
                    itemId,
                    item,
                    rowPalet,
                    context,
                    params = [],
                    context,
                    count,
                    totalPalets;
                /* Search for records */
                records = this.searchRecord();
                context = nlapiGetContext();
                count = records.length;
                for (iteratorI = 0; iteratorI < count; iteratorI++) {
                    //load each record to be updated.
                    rec = nlapiLoadRecord('purchaseorder', records[iteratorI].getId(), {
                        disabletriggers: true
                    });
                    for (iteratorJ = 1; iteratorJ <= rec.getLineItemCount('item'); iteratorJ++) {
                        // update each line item.
                        item = null;
                        itemId = rec.getLineItemValue('item', 'item', iteratorJ);
                        item = this.getItemDetails(itemId);
                        if (!!item) {
                            rowPalet = item.getValue('custitemcustitem4');
                            rec.setLineItemValue('item', 'custcolpallet_qty', iteratorJ, rowPalet);
                        }
                    }
                    totalPalets = this.fillIntegrationFields(rec);
                    try {
                        //try to submit record.
                        itemId = nlapiSubmitRecord(rec, {
                            disabletriggers: true
                        });
                        /* Logs detail in logger record*/
                        this.setLogs(itemId, 'success', 'Total Palets: ' + totalPalets);

                    } catch (e) {
                        /* Logs detail in logger record*/
                        this.setLogs(itemId, 'error', e);
                    }

                    /* Reschedule the script.*/
                    if (context.getRemainingUsage() < 1000) {
                        nlapiLogExecution('DEBUG', 'RESCHEDULING', 'From ID: ' + rec.getId());
                        params['custscript_last_internal_id'] = rec.getId();
                        nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
                        return;
                    }
                }
            } catch (e) {
                nlapiLogExecution('ERROR', 'Error during  Script working', e.toString());
            }
        },
        /* Search for purchase orders to be processed.*/
        searchRecord: function () {
            var filters = [],
                columns = [],
                records,
                context = nlapiGetContext(),
                scriptParam = context.getSetting('SCRIPT', 'custscript_last_internal_id');
            filters.push(new nlobjSearchFilter('type', null, 'is', 'PurchOrd'));
            filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
            if (!!scriptParam) {
                filters.push(new nlobjSearchFilter('internalidnumber', null, 'greaterthan', scriptParam));
            }
            filters.push(new nlobjSearchFilter('memorized', null, 'is', 'F'));
            columns.push((new nlobjSearchColumn('internalid')).setSort());


            records = nlapiSearchRecord('transaction', null, filters, columns);
            return records
        },

        /*
         * Insert padding after zero.
         */
        padZeros: function (roundedValue, decimalPlaces) {
            var valueString = roundedValue.toString(),
                decimalLocation = valueString.indexOf("."),
                decimalPartLength;
            if (decimalLocation === -1) {
                decimalPartLength = 0;
                valueString += decimalPlaces > 0 ? "." : "";
            } else {
                decimalPartLength = valueString.length - decimalLocation - 1;
            }
            var padTotal = decimalPlaces - decimalPartLength;
            if (padTotal > 0) {
                for (var counter = 1; counter <= padTotal; counter++) {
                    valueString += "0";
                }
            }
            return valueString;
        },

        /* Insert log into logger record.
        * */
        setLogs: function(itemId, status, message) {
            var log = nlapiCreateRecord('customrecord_old_po_status');
            log.setFieldValue('custrecord_po_id', itemId);
            log.setFieldValue('custrecord_po_status', status);
            log.setFieldValue('custrecord_po_message', message);
            nlapiSubmitRecord(log);

        },

        /* Round Amount*/
        round: function (n, prec) {
            var x = n * Math.pow(10, prec);
            var y = Math.round(x);
            var z = y / Math.pow(10, prec);
            if (isNaN(z)) {
                z = 0;
            }
            return this.padZeros(z, prec);
        },

        /* Round number up to decimal places.*/
        roundNumber: function (rnum) {
            var rlength = 2, // The number of decimal places to round to
                newnumber;
            if (rnum > 8191 && rnum < 10485) {
                rnum = rnum - 5000;
                newnumber = Math.round(rnum * Math.pow(10, rlength)) / Math.pow(10, rlength);
                newnumber = newnumber + 5000;
            } else {
                newnumber = Math.round(rnum * Math.pow(10, rlength)) / Math.pow(10, rlength);
            }
            return newnumber;
        },

        /**
         * Fill the line with palets fields
         */

        fillIntegrationFields: function (rec) {
            var totalPal = 0;
            rec.setFieldValue('custbodytotal_pallets', totalPal);

            for (var i = 1; i <= rec.getLineItemCount('item'); i++) {
                var pal = 0,
                    itemPalQty = parseFloat(rec.getLineItemValue('item', 'custcolpallet_qty', i)),
                    qty = parseFloat(rec.getLineItemValue('item', 'quantity', i));
                if ((!isNaN(itemPalQty)) && itemPalQty !== 0 && (!isNaN(qty))) {
                    pal = qty / itemPalQty; //0.04955444
                    pal = this.roundNumber(pal);
                }
                totalPal += pal;
            }
            totalPal = round(totalPal, 1);
            rec.setFieldValue('custbodytotal_pallets', totalPal);
            nlapiLogExecution('DEBUG', 'SO ', 'palette:' + totalPal);
            return totalPal;
        },

        /**
         * Get Item detail.
         * @param id
         * @returns {*}
         */
        getItemDetails: function (id) {
            var rec,
                filters = [],
                columns = [];
            filters.push(new nlobjSearchFilter('internalid', null, 'is', id));
            columns.push(new nlobjSearchColumn('type'));
            columns.push(new nlobjSearchColumn('custitemcustitem4'));
            rec = nlapiSearchRecord('item', null, filters, columns);
            if (!!rec && rec.length > 0) {
                return rec[0];
            }
        }
    };
})();

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function updateOldPoScheduled(type) {
    return updateOldPo.scheduled(type);
}