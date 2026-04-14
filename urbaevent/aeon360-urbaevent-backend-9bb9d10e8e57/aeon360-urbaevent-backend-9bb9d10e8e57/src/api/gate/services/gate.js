'use strict';

/**
 * gate service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::gate.gate');
