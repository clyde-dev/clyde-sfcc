'use strict';

var account = require('./account'),
    bonusProductsView = require('../bonus-products-view'),
    quickview = require('../quickview'),
    cartStoreInventory = require('../storeinventory/cart');

function appendToUrl(url, params) {
    var newUrl = url;
    newUrl += (newUrl.indexOf('?') !== -1 ? '&' : '?') + Object.keys(params).map(function (key) {
        return key + '=' + encodeURIComponent(params[key]);
    }).join('&');

    return newUrl;
}

/**
 * @private
 * @function
 * @description Binds events to the cart page (edit item's details, bonus item's actions, coupon code entry)
 */
function initializeEvents() {
    $('#cart-table').on('click', '.item-edit-details a', function (e) {
        e.preventDefault();
        quickview.show({
            url: e.target.href,
            source: 'cart'
        });
    })
        .on('click', '.bonus-item-actions a, .item-details .bonusproducts a', function (e) {
            e.preventDefault();
            bonusProductsView.show(this.href);
        });

    // override enter key for coupon code entry
    $('form input[name$="_couponCode"]').on('keydown', function (e) {
        if (e.which === 13 && $(this).val().length === 0) { return false; }
    });

    //to prevent multiple submissions of the form when removing a product from the cart
    var removeItemEvent = false;
    $('button[name$="deleteProduct"]').on('click', function (e) {
        if (removeItemEvent) {
            e.preventDefault();
        } else {
            removeItemEvent = true;
        }
    });

    // remove clyde product
    $('.delete-clyde-product').on('click', function (e) {
        var url = $(this).data('url');
        var uuid = $(this).data('uuid');
        var clydeuuid = $(this).data('clydeuuid');
        var urlParams = {
            uuid: uuid,
            clydeuuid: clydeuuid
        };
  
        url = appendToUrl(url, urlParams);
  
        $.ajax({
          url: url,
          type: 'POST',
          dataType: 'json'
      }).done(function (data) {
          if (data.success) {
              location.reload();
          }
      });
    });
}

exports.init = function () {
    initializeEvents();
    if (SitePreferences.STORE_PICKUP) {
        cartStoreInventory.init();
    }
    account.initCartLogin();
};
