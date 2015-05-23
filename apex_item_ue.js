/**
 * Created by: Sameer Ahmed Siddiqui
 * -
 * -
 * Dependencies: /util/*
 * -
 * - This User Even is attached to Item record of Apex Account.
 * This User Event is responsible of Setting Price ranges in the custom fields to show on web store when the item is on sale.
 */
/**
 * Common for getting field mapping.
 * @type {{categorizeByPriceLevel}}
 */
var PriceRangeCommon = (function() {
    return {
        /**
         * This method is responsible of returning Price ranges dependant on User Type.
         * @param matrixChilds
         * @returns {{msrp: {recs: Array, fld: string}, brickMortar: {recs: Array, fld: string}, premierDealer: {recs: Array, fld: string}, saleGroup: {recs: Array, fld: string}, online: {recs: Array, fld: string}}}
         */
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
 * Before Save handler of User Event
 * @type {{main}}
 */
var setPriceRangesBeforeLoad = (function() {
    return {
        main: function(type) {
            try {
                type = type.toString();
                var context = nlapiGetContext();
                if (context.getExecutionContext().toString().toLowerCase() === "userinterface" && type === "edit") {
                    ApexCommon.logDebug("setPriceRangesBeforeLoad", "starting");
                    var internalId = nlapiGetRecordId();
                    var matrixType = ItemDAO.isMatrixParent(internalId);
                    var matrixChilds, priceRange;

                    if (matrixType) {
                        /* Search matrix active childs */
                        matrixChilds = ItemDAO.getMatrixChilds(internalId);
                        nlapiSetFieldValue(ItemDAO.fieldName.IS_MATRIX_ITEM.id, 'T');
                        /* Get Price Range */
                        if (matrixChilds && matrixChilds.length > 0) {
                            var allRecs = PriceRangeCommon.categorizeByPriceLevel(matrixChilds);
                            for (var key in allRecs) {
                                priceRange = ItemDAO.getPriceRange(allRecs[key].recs);
                                nlapiSetFieldValue(allRecs[key].fld, priceRange);
                            }
                        }
                    }
                    ApexCommon.logDebug("setPriceRangesBeforeLoad", "finished");
                }

            } catch (ex) {
                ApexCommon.logException("setPriceRangesBeforeLoad", ex);
            }

        }

    };
})();

/**
 * After Save handler for User Event.
 * @type {{main}}
 */
var setPriceRangesAfterSave = (function() {
    return {
        main: function(type) {
            try {
                type = type.toString();
                var context = nlapiGetContext();
                if (context.getExecutionContext().toString().toLowerCase() === "userinterface" && type === "edit") {
                    ApexCommon.logDebug("setPriceRangesAfterSave", "starting");
                    var parent, matrixChilds, priceRange;
                    var internalId = nlapiGetRecordId();
                    var itemRec = nlapiLoadRecord(nlapiGetRecordType(), internalId);
                    var matrixType = itemRec.getFieldValue('matrixtype');

                    if (matrixType === 'PARENT' || matrixType === 'CHILD') {
                        if (matrixType === 'CHILD') {
                            parent = itemRec.getFieldValue('parent');
                            if (parent) {
                                internalId = parent;
                                /* should be done when all the fields are fetched from child */
                                itemRec = nlapiLoadRecord(nlapiGetRecordType(), internalId);
                            }
                        }
                        itemRec.setFieldValue(ItemDAO.fieldName.IS_MATRIX_ITEM.id, 'T');
                        /* load matrix active childs */
                        matrixChilds = ItemDAO.getMatrixChilds(internalId);

                        if (matrixChilds && matrixChilds.length > 0) {
                            var allRecs = PriceRangeCommon.categorizeByPriceLevel(matrixChilds);
                            for (var key in allRecs) {
                                priceRange = ItemDAO.getPriceRange(allRecs[key].recs);
                                itemRec.setFieldValue(allRecs[key].fld, priceRange);
                            }
                            nlapiSubmitRecord(itemRec);
                        }
                    }
                    ApexCommon.logDebug("setPriceRangesAfterSave", "finished");
                }

            } catch (ex) {
                ApexCommon.logException("setPriceRangesAfterSave", ex);
            }
        }

    };
})();

/**
 * After Submit handler of User Event.
 * @type {{main}}
 */
var setPriceRangesAfterSave = (function() {
    return {
        main: function(type, form, request) {
            try {
                type = type.toString();
                var context = nlapiGetContext();
                if (context.getExecutionContext().toString().toLowerCase() === "userinterface" && type === "view") {
                    var pricingCalDone = request.getParameter("pricingcaldone") ? "true" : "false";
                    if (pricingCalDone === "false") {
                        ApexCommon.logDebug("setPriceRangesBeforeLoad", "starting");
                        var internalId = nlapiGetRecordId();
                        var isParentMatrix = ItemDAO.isMatrixParent(internalId);
                        var matrixChilds, priceRange;

                        if (isParentMatrix) {
                            /* Search matrix active childs */
                            matrixChilds = ItemDAO.getMatrixChilds(internalId);
                            var itemRec = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId(), {
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

                            nlapiSetRedirectURL('RECORD', nlapiGetRecordType(), nlapiGetRecordId(), 'view', {
                                pricingcaldone: "true"
                            });
                        }
                        ApexCommon.logDebug("setPriceRangesBeforeLoad", "finished");
                    }
                }
            } catch (ex) {
                ApexCommon.logException("setPriceRangesBeforeLoad", ex);
            }
        }

    };
})();

/**
 * Below are the handler registered in NetSuite User Event.
 */

function beforeSubmit(type) {
    return setPriceRangesBeforeLoad.main(type);
}

function afterSubmit(type) {
    return setPriceRangesAfterSave.main(type);
}

function beforeLoad(type, form, request) {
    return setPriceRangesBeforeLoad.main(type, form, request);
}