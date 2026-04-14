"use strict";

/**
 * apple controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::apple.apple", ({ strapi }) => ({
	// findOne by socialId ================
	async findOne(ctx) {
		const { socialId } = ctx.params;
		const data = await strapi.db.query("api::apple.apple").findOne({
			where: { socialId },
		});
		const sanitizedEntity = await this.sanitizeOutput(data, ctx);
		return this.transformResponse(sanitizedEntity);
	},

	// update by socialId ================
	async update(ctx) {
		const { socialId } = ctx.params;
		const { data } = ctx.request.body;
		await strapi.db.query("api::apple.apple").updateMany({
			where: { socialId: socialId },
			data: data,
		});
		return ctx.send({ message: "OK" }, 200);
	},
}));
