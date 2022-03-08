'use strict';
var proxyrequire = require('proxyquire').noCallThru().noPreserveCache();

var clydeProductSearch = proxyrequire('../../../cartridges/bm_clyde/cartridge/scripts/factories/products/clydeProductSearch.js', {
    'dw/catalog/ProductSearchHit': require('../../mocks/dw/catalog/ProductSearchHit.js'),
    'dw/catalog/ProductSearchModel': require('../../mocks/dw/catalog/ProductSearchModel.js'),
    'dw/catalog/CatalogMgr': require('../../mocks/dw/catalog/CatalogMgr'),
    'dw/system/Logger': require('../../mocks/dw/system/Logger'),
    'dw/catalog/ProductMgr': require('../../mocks/dw/catalog/ProductMgr'),

});

module.exports = clydeProductSearch;
