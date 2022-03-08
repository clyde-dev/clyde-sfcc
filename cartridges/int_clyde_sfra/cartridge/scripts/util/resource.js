
var Site = require('dw/system/Site');

/**
 * Resource helper
 *
 */
function ResourceHelper() {}

/**
 * Get the client-side preferences of a given page
 * @returns {Object} An objects key key-value pairs holding the preferences
 */
ResourceHelper.getClydePreferences = function () {
    return {
        CLYDE_WIDGET_ENABLED: Site.current.preferences.custom.clydeWidgetDisplay ? true : false, // eslint-disable-line no-unneeded-ternary
        CLYDE_API_KEY: Site.current.preferences.custom.clydeAPIKey || '',
        CLYDE_WIDGET_ENVIRONMENT: Site.current.preferences.custom.clydeWidgetEnviroment ? Site.current.preferences.custom.clydeWidgetEnviroment.value : '',
        CLYDE_SKIP_GEO_IP: Site.current.preferences.custom.clydeSkipGeoIP ? true : false  // eslint-disable-line no-unneeded-ternary
    };
};

module.exports = ResourceHelper;
