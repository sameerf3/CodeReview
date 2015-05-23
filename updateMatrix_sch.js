/**
 * Created by: Sameer Ahmed Siddiqui
 * -
 * -
 * Dependencies: /util/*
 * -
 * - This scheduled script is kind of setup script.
 * Runs only one at time of deployment to update the price ranges of matrix items.
 */
/**
 * This method is responsible of returning Price ranges dependant on User Type
 * @type {{categorizeByPriceLevel}}
 */
var PriceRangeCommon = (function() {
    return {
        categorizeByPriceLevel: function(matrixChilds) {
            var len = matrixChilds.length;
            var msrpRecs = [],
                brickMortarRecs = [],
                premierDealerRecs = [],
                saleGB = [],
                onlineRecs = [];

            for (var i = 0; i < len; i++) {
                var priceLevel = matrixChilds[i].getValue('pricelevel', 'pricing');
                switch (priceLevel) {
                    case ItemDAO.priceLevels.MSRP:
                        msrpRecs.push(matrixChilds[i]);
                        break;
                    case ItemDAO.priceLevels.BrickMortar:
                        brickMortarRecs.push(matrixChilds[i]);
                        break;
                    case ItemDAO.priceLevels.PremierDealer:
                        premierDealerRecs.push(matrixChilds[i]);
                        break;
                    case ItemDAO.priceLevels.SaleGroupBy:
                        saleGB.push(matrixChilds[i]);
                        break;
                    case ItemDAO.priceLevels.Online:
                        onlineRecs.push(matrixChilds[i]);
                        break;
                    default:
                        break;
                }
            }

            /**
             * Field mapping JSON for different price levels/
             */
            var allRecs = {
                msrp: {
                    recs: msrpRecs,
                    fld: ItemDAO.fieldName.MSRP_PRICE_RANGE.id
                },
                brickMortar: {
                    recs: brickMortarRecs,
                    fld: ItemDAO.fieldName.BM_PRICE_RANGE.id
                },
                premierDealer: {
                    recs: premierDealerRecs,
                    fld: ItemDAO.fieldName.PD_PRICE_RANGE.id
                },
                saleGroup: {
                    recs: saleGB,
                    fld: ItemDAO.fieldName.SG_PRICE_RANGE.id
                },
                online: {
                    recs: onlineRecs,
                    fld: ItemDAO.fieldName.ONLINE_PRICE_RANGE.id
                }
            };
            return allRecs;
        }
    };
})();


/**
 * All business logic is encapsulated in this class.
 */
var updatePriceRanges = (function() {
    return {
        startTime: null,
        minsAfterResch: 50,
        remainingUsageAfterResch: 500,

        /**
         * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
         * @returns {}
         */
        scheduled: function(type) {
            try {
                this.startTime = (new Date()).getTime();
                ApexCommon.logDebug("Starting");
                var ctx = nlapiGetContext();
                var lastId = ctx.getSetting('SCRIPT', 'custscript_update_matrix_last_id');
                nlapiLogExecution('DEBUG', 'lastId', lastId);
                var noOfRecsProcessed = parseInt(ctx.getSetting('SCRIPT', 'custscript_update_matrix_no_recs_proce'));
                nlapiLogExecution('DEBUG', 'no of recs processed', noOfRecsProcessed);


                if (ApexCommon.isBlankOrNull(noOfRecsProcessed) || isNaN(noOfRecsProcessed)) {
                    noOfRecsProcessed = 0;
                }

                var recs = this.getItems(lastId);
                while (recs !== null && recs.length > 0) {
                    var len = recs.length;
                    for (var i = 0; i < len; i++) {
                        ApexCommon.logDebug("processing item rec", recs[i].getId());
                        var internalId = recs[i].getId();
                        var matrixChilds, priceRange, recType;
                        /* Search matrix active childs */
                        matrixChilds = ItemDAO.getMatrixChilds(internalId);
                        if (recs[i].getValue('type').toLowerCase() === "invtpart") {
                            recType = "inventoryitem";
                        } else {
                            recType = "kititem";
                        }

                        var itemRec = nlapiLoadRecord(recType, recs[i].getId(), {
                            disabletriggers: true
                        });
                        itemRec.setFieldValue(ItemDAO.fieldName.IS_MATRIX_ITEM.id, 'T');
                        /* Get Price Range */
                        if (matrixChilds && matrixChilds.length > 0) {
                            var allRecs = PriceRangeCommon.categorizeByPriceLevel(matrixChilds);
                            for (var key in allRecs) {
                                priceRange = ItemDAO.getPriceRange(allRecs[key].recs);
                                itemRec.setFieldValue(allRecs[key].fld, priceRange);
                            }
                        }
                        nlapiSubmitRecord(itemRec, {
                            disabletriggers: true,
                            ignoremandatoryfields: true
                        });

                        noOfRecsProcessed += 1;
                        nlapiLogExecution('DEBUG', 'no of recs processed', noOfRecsProcessed);

                        if (ctx.getSetting('SCRIPT', 'custscript_update_matrix_no_recs_proce') == 'stop') {
                            return;
                        }
                        lastId = recs[i].getValue('internalid');
                        var params = [];
                        params['custscript_update_matrix_last_id'] = lastId;
                        params['custscript_update_matrix_no_recs_proce'] = noOfRecsProcessed;

                        if (ScheduleOp.rescheduleIfNeeded(nlapiGetContext(), params, this.startTime, this.remainingUsageAfterResch, this.minsAfterResch)) {
                            return;
                        }
                    }
                    // fetching more records
                    recs = this.getItems(lastId);
                }

            } catch (e) {
                ApexCommon.logException('Error in scheduling Script.', e);
            }
        },
        /**
         * This methods search for the items after the item that is last processed
         * @param lastId
         * @returns {*}
         */
        getItems: function(lastId) {
            try {
                var filters = [],
                    columns = [];
                filters.push(new nlobjSearchFilter('matrixchild', null, 'is', 'F'));
                filters.push(new nlobjSearchFilter('matrix', null, 'is', 'T'));
                filters.push(new nlobjSearchFilter('type', null, 'anyof', ['InvtPart', 'Kit']));
                //filters.push(new nlobjSearchFilter('internalid', null, 'anyof', ['1436']));
                if (!ApexCommon.isBlankOrNull(lastId)) {
                    filters.push(new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lastId));
                }

                columns.push(new nlobjSearchColumn('type'));
                columns.push(new nlobjSearchColumn('internalid').setSort());

                var recs = nlapiSearchRecord('item', null, filters, columns);
                return recs;
            } catch (e) {
                ApexCommon.logException('Error in fetching items list.', e);
                return null;
            }
        }
    };
})();

/**
 *
 * Main function registered in NetSuite for scheduled script.
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function schedule(type) {
    return updatePriceRanges.scheduled(type);
}