'use strict';

/**
 * gate router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::gate.gate');
