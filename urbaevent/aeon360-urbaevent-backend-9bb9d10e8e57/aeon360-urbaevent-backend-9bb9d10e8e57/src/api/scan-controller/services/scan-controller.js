'use strict';

/**
 * scan-controller service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::scan-controller.scan-controller');
