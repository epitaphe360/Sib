'use strict';

/**
 * scan-controller router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::scan-controller.scan-controller');
