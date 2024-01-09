var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Remove Clyde Contracts from cart', function () {
    this.timeout(50000);

    var pid = '013742003314M';
    var qty = 1;
    var option = {optionId:"clydeWarranty", selectedValueId: "TEST1Y500"};
    var options = [];
    options.push(option);

    var addedProductUUID;

    var cookieJar = request.jar();
    var myRequest = {
        url: '',
        method: 'POST',
        rejectUnauthorized: false,
        resolveWithFullResponse: true,
        jar: cookieJar,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    };

    var cookieString;

    before(function () {
        // ----- adding product #1:
        myRequest.url = config.baseUrl + '/Cart-AddProduct';
        myRequest.form = {
            pid: pid,
            quantity: qty,
            options: JSON.stringify(option),
            clydeContractSku: "TEST1Y500",
            clydeContractPrice: 36
        };

        return request(myRequest)
            .then(function (response) {
                cookieString = cookieJar.getCookieString(myRequest.url);
                var responseObj = JSON.parse(response.body);
                addedProductUUID = responseObj.pliUUID;
            })
    });

    it('should remove the cldyde product from cart', function () {
        myRequest.url = config.baseUrl + '/Cart-RemoveClydeProduct?uuid=' + addedProductUUID;
        return request(myRequest)
            .then(function (myRequest) {
                assert.equal(myRequest.statusCode, 200, 'Expected statusCode to be 200.');
            });
    });

});
