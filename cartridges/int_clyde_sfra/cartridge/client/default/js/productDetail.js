'use strict';

/* global $, document, Clyde, ClydeSitePreferences */

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./product/detail'));
});
