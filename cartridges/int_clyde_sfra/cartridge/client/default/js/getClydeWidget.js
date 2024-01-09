'use strict';

/* global $, document, Clyde, ClydeSitePreferences */

var clydeWidget;
var elem = document.querySelector('.product-number span');
var productId = elem ? elem.textContent : null;

if (window.ClydeSitePreferences && window.ClydeSitePreferences.CLYDE_WIDGET_ENABLED === true && Clyde && !Clyde.checkReady() && productId) {
    Clyde.init({
        key: ClydeSitePreferences.CLYDE_API_KEY,
        defaultSelector: '#clyde-cta',
        skipGeoIp: ClydeSitePreferences.CLYDE_SKIP_GEO_IP
    }, function () {
        var clydeWidgetHandler = Clyde.getSettings();
        if (clydeWidgetHandler.productPage === true) {
            Clyde.setActiveProduct(productId);
        }
    });
}

clydeWidget = {
    getSelectedClydeContract: function (form) {
        var clydeContract = Clyde.getSelectedContract();
        if (clydeContract) {
            if (document.getElementById('clydeContractSku')) {
                form.find('#clydeContractSku').attr('value', clydeContract.sku);
                form.find('#clydeContractPrice').attr('value', clydeContract.recommendedPrice);
            } else {
                var clydeForm = form;
                clydeForm.clydeContractSku = clydeContract.sku;
                clydeForm.clydeContractPrice = clydeContract.recommendedPrice;
                return clydeForm;
            }
        }
        return form;
    },
    getClydeVariantChange: function (variantId) {
        if (window.ClydeSitePreferences.CLYDE_WIDGET_ENABLED === true && Clyde && variantId) {
            var previousId = Clyde.getActiveProduct() ? Clyde.getActiveProduct().sku : null;
            // If there was no active variant, or the previous one is different from the new one
            if (previousId && previousId !== variantId) {
                Clyde.setActiveProduct(variantId);
            }
        }
    }
};

module.exports = clydeWidget;
