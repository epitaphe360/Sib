'use strict';

/**
 * gate controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::gate.gate');
