"use strict";

/**
 * scan controller
 */

const utils = require("@strapi/utils");
const { NotFoundError, ApplicationError } = utils.errors;
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::scan.scan", ({ strapi }) => ({
	async find(ctx) {
		ctx.query = { ...ctx.query, pagination: { pageSize: 999999 }, sort: { createdAt: "desc" } };
		const scans = await super.find(ctx);
		return scans;
	},

	async create(ctx) {
		const { userScannerId, registrationId } = ctx.request.body.data;

		// ================================================
		const userScanner = await strapi.entityService.findOne("plugin::users-permissions.user", userScannerId);
		if (!userScanner || userScanner.confirmed == false) throw new ApplicationError("You are not allowed to scan yet, your account need to be confirmed first");

		// ================================================
		const scannedRegistration = await strapi.entityService.findOne("api::registration.registration", registrationId, {
			populate: { event: true, user: true },
		});
		if (!scannedRegistration) throw new NotFoundError("eBadge Not Found");
		const eventId = scannedRegistration.event.id;
		const userScannedId = scannedRegistration.user.id;
		const scannedRegistrationType = scannedRegistration.type;

		// ================================================
		const scannerRegistration = await strapi.db.query("api::registration.registration").findOne({
			where: { user: userScannerId, event: eventId },
			populate: { event: true },
		});
		if (!scannerRegistration || eventId != scannerRegistration.event.id) throw new ApplicationError("You are not registered on the same event");
		if (!scannerRegistration.confirmed) throw new ApplicationError("You are not allowed to scan yet, your event registration need to be confirmed first");
		const scannerRegistrationType = scannerRegistration.type;

		// ================================================
		const scanExist = await strapi.entityService.findMany("api::scan.scan", {
			filters: {
				$and: [{ users: userScannerId }, { users: userScannedId }],
			},
		});
		if (scanExist.length > 0) throw new ApplicationError("Contacts already matched");

		// ================================================
		const scan = await strapi.entityService.create("api::scan.scan", {
			data: {
				event: eventId,
				users: [userScannerId, userScannedId],
				typeScanner: scannerRegistrationType,
				typeScanned: scannedRegistrationType,
			},
		});
		ctx.body = { data: scan };
	},
}));
