'use strict';
/* eslint no-use-before-define: ["error", {"functions": false}]*/
/* eslint operator-assignment: ["error", "never"] */
/**
 * This Job sends orders to the Clyde via API and creates orders on Clyde side.
 * @module orders/sendOrders
*/
const Logger = require('dw/system/Logger');
const Site = require('dw/system/Site');
const Status = require('dw/system/Status');
const Order = require('dw/order/Order');
const OrderMgr = require('dw/order/OrderMgr');
const clydeHelper = require('~/cartridge/scripts/clydeHelper');
var jobStartDateAndTime;

let isThisDryRun = true;
let totalOrderCount = 0;
/**
 * @param {Object} args - job parameter args.
 * @return {dw.system.Status} Exit status for a job run
 */
var run = function (args) {
    Logger.info('Start orders sending to Clyde for siteID: {0}', Site.current.ID);
    jobStartDateAndTime = Site.getCurrent().getCalendar().getTime();

    // If true, then job will run without sending the orders to Clyde.
    isThisDryRun = args.isDryRun;

    // If provided then the job will start with the given order (qualify orders are sorted in ascending order)
    let startingOrderNo = args['Starting Order Number'];

    try {
        var queryObject = orderQuery(startingOrderNo);
        var orderIterator = OrderMgr.searchOrders(queryObject.query, 'orderNo ASC', queryObject.params);

        while (orderIterator.hasNext()) {
            var order = orderIterator.next();
            sendRequest(order);
        }

        Logger.info('Sent ' + totalOrderCount + ' orders to sync with Clyde');
        // Record this runtime in custom preference.
        if (totalOrderCount > 0) {
            setLastOrderSyncTime(jobStartDateAndTime);
        }
    } catch (e) {
        Logger.error('Error occurred while searching for orders {0}', e.message);
        return new Status(Status.ERROR);
    }
    return new Status(Status.OK);
};
/**
 * To create query object for orders sync
 * @param {string} startingOrderNo - the last order no to be taken from logs.
 * @returns {Object} return the object that has query object and query params.
 */
function orderQuery(startingOrderNo) {
    let days = Site.getCurrent().getCustomPreferenceValue('clydeDateForDays');
    let fromDate = getLastOrderSyncTime() || clydeHelper.getDateForDays(Number(days));// or yesterday's date
    let query = '(exportStatus={0} OR exportStatus={1}) AND creationDate>={2} AND (status != {3} AND status != {4})';

    var queryParams = [];
    queryParams.push(Order.EXPORT_STATUS_READY);
    queryParams.push(Order.EXPORT_STATUS_EXPORTED);
    queryParams.push(fromDate);
    queryParams.push(Order.ORDER_STATUS_FAILED);
    queryParams.push(Order.ORDER_STATUS_CANCELLED);

    // If provided then the job will start with the given order (qualify orders are sorted in ascending order)
    if (startingOrderNo) {
        query = query + 'AND orderNo>={5}';
        queryParams.push(startingOrderNo);
    }
    queryParams.push('orderNo ASC');
    // Disable syncing orders that do not contain a Contract Sale
    var syncOnlyContractOrders = Site.getCurrent().getCustomPreferenceValue('syncOnlyContractOrders');
    if (syncOnlyContractOrders) {
        query = query + ' AND custom.isContainClydeContract=' + syncOnlyContractOrders;
    }

    return {
        query: query,
        params: queryParams
    };
}

/**
 * call back function after API call
 * @param {Order} order - Order object to be sent to API.
 */
function sendRequest(order) {
    totalOrderCount++;
    if (!isThisDryRun) {
        var orderRequest = getOrderRequest(order);
        let result = clydeHelper.clydeServiceCall(clydeHelper.HTTP_METHOD.POST, clydeHelper.METHOD.ORDERS, orderRequest);

        if (!result) {
            Logger.error('Unable to send order# {0} to clyde, ERROR:', order.getOrderNo(), result);
        } else {
            Logger.info('Sent order# {0} to clyde', order.getOrderNo(), result);
        }
    }
}

/**
 * getLastOrderSyncTime to get lastRunTime of the job execution
 * @returns {lastRunTime} return the last run time of the job.
 */
function getLastOrderSyncTime() {
    let clydeSitePreference = require('~/cartridge/scripts/utils/clydeSitePreferences');
    let sitePreferenceID = clydeHelper.CONSTANTS.LAST_SYNC_SEND_ORDER;
    let storedLastJobRunTime = clydeSitePreference.getSitePreferenceValue(sitePreferenceID);
    return storedLastJobRunTime;
}

/**
 * setLastOrderSyncTime to set the run time after the successful job execution
 * @param {string} jobStartingDateAndTime - CustomObject name.
 */
function setLastOrderSyncTime(jobStartingDateAndTime) {
    try {
        let clydeSitePreference = require('~/cartridge/scripts/utils/clydeSitePreferences');
        let sitePreferenceID = clydeHelper.CONSTANTS.LAST_SYNC_SEND_ORDER;
        clydeSitePreference.setSitePreferenceValue(sitePreferenceID, jobStartingDateAndTime);
    } catch (e) {
        Logger.error('Error on setting  last run time: ' + e.message);
    }
}
/**
 * Get order object details
 * @param {Order} order - Order object.
 * @returns {request} return the request object.
 */
function getOrderRequest(order) {
    var request;
    if (order) {
        var plis = order.allProductLineItems;
        var lineItems = [];
        var contractSales = [];
        var lineItemIDs = [];

        for (var i = 0; i < plis.length; i++) {
            var pli = plis[i];

            if (pli && pli.optionProductLineItem && /clydewarranty/i.test(pli.optionID)) {
                continue; // eslint-disable-line no-continue
            }

            if (pli) {
                lineItems.push({
                    id: pli.getUUID(),
                    productSku: pli.productID,
                    price: pli.adjustedPrice ? pli.adjustedPrice.value : 0,
                    quantity: pli.quantityValue,
                    serialNumber: ''
                });

                lineItemIDs.push({
                    lineItemId: pli.getUUID(),
                    productSku: pli.productID,
                    price: pli.adjustedPrice ? pli.adjustedPrice.value : 0
                });
            }
        }

        var clydeProdMap = order.custom.clydeContractProductMapping;
        if (!empty(clydeProdMap)) {
            try {
                if (!empty(clydeProdMap)) {
                    var parsedValue = JSON.parse(clydeProdMap);
                    var lineItemId = null;
                    var quantity = null;
                    var productPrice = 0;

                    for (var j = 0; j < parsedValue.length; j++) {
                        var productSku = parsedValue[j].productId;

                        for (var x = 0; x < lineItemIDs.length; x++) {
                            if (productSku === lineItemIDs[x].productSku) {
                                lineItemId = lineItemIDs[x].lineItemId;
                                productPrice = lineItemIDs[x].price;
                                break;
                            }
                        }

                        quantity = parsedValue[j].quantity;

                        for (var count = 0; count < quantity; count++) {
                            contractSales.push({
                                lineItemId: lineItemId,
                                productSku: productSku,
                                contractSku: parsedValue[j].contractSku,
                                productPrice: productPrice,
                                contractPrice: parsedValue[j].contractPrice
                            });
                        }
                    }
                }
            } catch (e) {
                Logger.error('Error occurred while parsing JSON on getOrderRequest()' + e);
            }
        }
        request = {
            data: {
                type: 'order',
                id: order.orderNo,
                attributes: {
                    customer: {
                        firstName: order.billingAddress.firstName,
                        lastName: order.billingAddress.lastName,
                        email: order.customerEmail,
                        phone: order.billingAddress.phone,
                        address1: order.billingAddress.address1,
                        address2: order.billingAddress.address2 ? order.billingAddress.address2 : '',
                        city: order.billingAddress.city,
                        province: order.billingAddress.stateCode,
                        zip: order.billingAddress.postalCode,
                        country: order.billingAddress.countryCode.value
                    },
                    contractSales: contractSales,
                    lineItems: lineItems
                }
            }
        };
    }
    return request;
}

exports.Run = run;
