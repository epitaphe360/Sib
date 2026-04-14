"use strict";

/**
 * conference controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::conference.conference", ({ strapi }) => ({
	async find(ctx) {
		ctx.query = { ...ctx.query, pagination: { pageSize: 999999 }, sort: { date: "asc", startTime: "asc" } };
		const conferences = await super.find(ctx);
		return conferences;
	},
}));
