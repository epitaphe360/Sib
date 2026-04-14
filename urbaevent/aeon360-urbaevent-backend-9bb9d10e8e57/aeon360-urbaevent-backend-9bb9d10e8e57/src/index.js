"use strict";
const utils = require("@strapi/utils");

module.exports = {
	register(/*{ strapi }*/) {},

	async bootstrap({ strapi }) {
		await strapi.db.lifecycles.subscribe({
			models: ["plugin::users-permissions.user"],

			async afterCreate(event) {
				const { result, params } = event;

				// ================================================================================
				// Collaborator added by exhbitor =================================================
				// ================================================================================
				/* if (params.data.eventIdforCollaborator) {
					const createRegistration = await strapi.entityService.create("api::registration.registration", {
						data: {
							user: result.id,
							event: params.data.eventIdforCollaborator,
							type: "collaborator",
							confirmed: true,
						},
						populate: { event: true },
					});
					if (createRegistration != null) {
						const randomstring = require("randomstring");
						const password = randomstring.generate({ length: 6, charset: "numeric" });
						const updateCollaboratorPwd = await strapi.entityService.update("plugin::users-permissions.user", result.id, {
							data: { password: password },
						});
						if (updateCollaboratorPwd != null) {
							strapi.service("api::brevo.brevo").sendEmail(26, result.email, { nom: result.name, email: result.email, password: password });
						}
						// Send badge Email ===============
						strapi.service("api::brevo.brevo").sendEmail(22, result.email, {
							nom: result.name,
							event: createRegistration.event.name,
							eventDate: createRegistration.event.dateString,
							eventLocation: createRegistration.event.locationAddress,
							urlToBadge: process.env.URL + "/api/registrations/downloadEbadgeFull/" + createRegistration.id,
						});
					}
				} */
			},

			async afterFindOne(event) {
				const { result } = event;
				const ctx = strapi.requestContext.get();
				if (ctx.request.query?.os != undefined) {
					const id = result.id;
					const fcm = ctx.request.query.fcm;
					const os = ctx.request.query.os;
					const appVersion = ctx.request.query.appVersion;
					strapi.db.connection.raw(`update up_users set fcm=?, os=?, app_version=? where id=?`, [fcm, os, appVersion, id]).then((res) => {
						console.log("=============");
						console.log(res);
						console.log("=============");
					});
				}
			},
		});
	},
};
