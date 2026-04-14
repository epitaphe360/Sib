"use strict";

/**
 * scan-controller controller
 */

const utils = require("@strapi/utils");
const { NotFoundError, ApplicationError } = utils.errors;
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::scan-controller.scan-controller", ({ strapi }) => ({
	async create(ctx) {
		const { event, user, gate, type, controller } = ctx.request.body.data;

		// ================================================
		const scanExist = await strapi.entityService.findMany("api::scan-controller.scan-controller", {
			filters: { event: event, user: user, gate: gate },
		});
		if (scanExist.length > 0) throw new ApplicationError("Contacts already scanned for this Event / Gate");

		// ================================================
		const scan = await strapi.entityService.create("api::scan-controller.scan-controller", {
			data: {
				event: event,
				user: user,
				gate: gate,
				type: type,
				controller: controller,
			},
		});
		ctx.body = { data: scan };
	},
}));
