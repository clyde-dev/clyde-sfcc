'use strict';

/* Script Modules */
var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');

function addContract() {
    var addClydeContract = require('*/cartridge/scripts/clydeAddContracts');
    var BasketMgr = require('dw/order/BasketMgr');
    var Resource = require('dw/web/Resource');

    var currentBasket = BasketMgr.getCurrentBasket();
    var queryString = request.httpParameterMap;
    var pid = queryString.pid.stringValue;
    var clydeSku = queryString.clydeContractSku.stringValue;

    var response = require('*/cartridge/scripts/util/Response');

    var result = {
        error: false,
        message: ''
    };

    if (!empty(pid) && !(empty(clydeSku))) {
        var contractResult = addClydeContract.setClydeCartContracts(pid, clydeSku, currentBasket);
        response.renderJSON(contractResult)
    } else {
        result.error = true;
        result.message = Resource.msg('error.cannot.update.product', 'cart', null)
        response.renderJSON(result)
    }
}

exports.AddContract = guard.ensure(['get'], addContract);