var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);

describe('Remove Clyde Product to Cart', function () {
    var cookieJar = request.jar();

    var updateQuantity = {
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
        // ----- adding Clyde product #1:
        updateQuantity.url = config.baseUrl + '/Cart-AddProduct';
        updateQuantity.form = {
            pid: '701644391980M',
            options: ['TEST3Y500'],
            quantity: 1
        };

        return request(updateQuantity)
            .then(function () {
                cookieString = cookieJar.getCookieString(updateQuantity.url);
            })
            console.log(res.json)

    });

    // it('should verify that contract is add to cart', function () {
    // this.timeout(10000);
    //     var qty1 = 1;
    //     var variantPid = '701644329402M';
    //     var clydeContractSKU = 'TEST3Y500';
    //     var addToCartRequest = {
    //         url: '',
    //         method: 'GET',
    //         rejectUnauthorized: false,
    //         resolveWithFullResponse: true,
    //         jar: cookieJar,
    //         headers: {
    //             'X-Requested-With': 'XMLHttpRequest'
    //         }
    //     };
    // });

    it('should verify that contract is Removed from Cart', function () {
        this.timeout(10000);
            var pid = '701644391980M';
            // var optionLineItems = pid.optionProductLineItems.iterator();
            var uuid = '9605949c67a29bb626abe06282';
            var removeToCartRequest = {
                url: '',
                method: 'POST',
                rejectUnauthorized: false,
                resolveWithFullResponse: true,
                jar: cookieJar,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };

            removeToCartRequest.url = config.baseUrl + '/Cart-RemoveClydeProduct?uuid=' + uuid;
            return request(removeToCartRequest)
                .then(function (response) {
                    var bodyAsJson = JSON.parse(response.success, true);
                    assert.equal(bodyAsJson.error, false);
                });
        });
})