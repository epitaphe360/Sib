const utils = require("@strapi/utils");
const { NotFoundError, ValidationError } = utils.errors;
const { getService } = require("@strapi/plugin-users-permissions/server/utils");
const { getAbsoluteAdminUrl, getAbsoluteServerUrl, sanitize } = utils;

module.exports = (plugin) => {
	// Register  ==================================================================================
	plugin.controllers.auth.register = async (ctx) => {
		let data = ctx.request.body;
		/* if (data.eventIdforCollaborator != undefined) {
			data.event = data.eventIdforCollaborator;
		} */

		// ========================================================================================
		// Signup from Mobile App =================================================================
		// ========================================================================================
		if (data.emailOTP) {
			const user = await strapi.entityService.create("plugin::users-permissions.user", { data: data });
			strapi.service("api::brevo.brevo").sendEmail(13, data.email, { emailOTP: data.emailOTP });

			return ctx.send({
				jwt: getService("jwt").issue({ id: user.id }),
				user: await sanitizeUser(user, ctx),
			});
		}

		// ========================================================================================
		// Signup from Admin panel or Website btp-expo.ma =========================================
		// =======================================================================================
		else {
			const entries = await strapi.entityService.findMany("plugin::users-permissions.user", {
				filters: { email: data.email },
				populate: { registrations: true },
			});
			var user = null;
			const randomstring = require("randomstring");
			const password = randomstring.generate({ length: 6, charset: "numeric" });
			if (entries.length > 0) {
				user = await strapi.entityService.update("plugin::users-permissions.user", entries[0].id, { data: { ...data, password: password }, populate: { registrations: true } });
				await strapi.service("api::brevo.brevo").sendEmail(20, user.email, { nom: user.name, email: user.email, password: password });
			} else {
				user = await strapi.entityService.create("plugin::users-permissions.user", { data: { ...data, password: password } });
				await strapi.service("api::brevo.brevo").sendEmail(20, user.email, { nom: user.name, email: user.email, password: password });
			}
			if (user != null) {
				try {
					// Create registration of the event if it doesn't exist ==========================
					var registration = null;
					const registrations = await strapi.entityService.findMany("api::registration.registration", {
						filters: { event: data.event, user: user.id },
						populate: { event: true },
					});
					if (registrations.length > 0) {
						registration = registrations[0];
					} else {
						registration = await strapi.entityService.create("api::registration.registration", {
							data: { user: user.id, event: data.event, type: data.type, confirmed: data.type == "exhibitor" ? false : true, message: data.message },
							populate: { event: true },
						});
					}
					const templateId = registration.type == "visitor" ? 25 : 22;
					// Send badge Email ===============
					await strapi.service("api::brevo.brevo").sendEmail(templateId, user.email, {
						nom: user.name,
						event: registration.event.name,
						eventDate: registration.event.dateString,
						eventLocation: registration.event.locationAddress,
						urlToBadge: process.env.URL + "/api/registrations/downloadEbadgeFull/" + registration.id,
					});
					ctx.send({ registrationId: registration.id }, 200);
				} catch (error) {
					console.log("============== ERROR ===========");
					console.log(error);
					console.log("============== /ERROR ==========");
				}
			} else {
				ctx.send({ message: "KO" }, 400);
			}
		}
	};

	// Forgot Password / Send EmailOTP  ===========================================================
	plugin.controllers.auth.forgotPassword = async (ctx) => {
		const { email } = ctx.request.body;
		const user = await strapi.db.query("plugin::users-permissions.user").findOne({ where: { email: email } });
		if (user) {
			const randomstring = require("randomstring");
			const code = randomstring.generate({ length: 4, charset: "numeric" });
			const entry = await strapi.entityService.update("plugin::users-permissions.user", user.id, {
				data: { resetPasswordToken: code },
			});
			strapi.service("api::brevo.brevo").sendEmail(14, email, { code: code });
			ctx.send({ data: true });
		} else {
			throw new NotFoundError("User not found");
		}
	};

	// verifyEmailOTP =============================================================================
	plugin.controllers.user.verifyEmailOTP = async (ctx) => {
		const { userId, otp } = ctx.request.body;
		const user = await strapi.entityService.findOne("plugin::users-permissions.user", userId);
		if (user) {
			if (otp == user.emailOTP) {
				const entry = await strapi.entityService.update("plugin::users-permissions.user", userId, {
					data: { emailOTPConfirmed: true },
				});
				ctx.send({ data: true });
			} else {
				throw new ValidationError("Invalid email OTP");
			}
		} else {
			throw new NotFoundError("User not found");
		}
	};

	// resendEmailOTP =============================================================================
	plugin.controllers.user.resendEmailOTP = async (ctx) => {
		const { email } = ctx.request.body;
		const user = await strapi.db.query("plugin::users-permissions.user").findOne({ where: { email: email } });
		if (user) {
			const randomstring = require("randomstring");
			const emailOTP = randomstring.generate({ length: 4, charset: "numeric" });
			await strapi.entityService.update("plugin::users-permissions.user", user.id, {
				data: { emailOTP: emailOTP },
			});
			strapi.service("api::brevo.brevo").sendEmail(13, email, { emailOTP: emailOTP });
			ctx.send({ data: true });
		} else {
			throw new NotFoundError("User not found");
		}
	};

	// sendCreds ==================================================================================
	plugin.controllers.user.sendCreds = async (ctx) => {
		const { userId } = ctx.params;
		const user = await strapi.entityService.findOne("plugin::users-permissions.user", userId);
		if (user) {
			const randomstring = require("randomstring");
			const password = randomstring.generate({ length: 6, charset: "numeric" });
			const update = await strapi.entityService.update("plugin::users-permissions.user", userId, {
				data: { credsSent: true, password: password, emailOTPConfirmed: true, confirmed: true },
			});
			if (update != null) {
				strapi.service("api::brevo.brevo").sendEmail(20, user.email, { nom: user.name, email: user.email, password: password });
				ctx.send({ data: true });
			}
		}
	};

	// Social =====================================================================================
	plugin.controllers.auth.social = async (ctx) => {
		const { identifier, provider, socialId } = ctx.request.body;
		const user = await strapi.db.query("plugin::users-permissions.user").findOne({
			where: { email: identifier, provider: provider, socialId: socialId },
		});
		if (user) {
			return ctx.send({
				jwt: getService("jwt").issue({ id: user.id }),
				user: await sanitizeUser(user, ctx),
			});
		} else {
			throw new NotFoundError("User not found");
		}
	};

	const sanitizeUser = (user, ctx) => {
		const { auth } = ctx.state;
		const userSchema = strapi.getModel("plugin::users-permissions.user");
		return sanitize.contentAPI.output(user, userSchema, { auth });
	};

	// ============================================================================================
	// Routes =====================================================================================
	// ============================================================================================
	plugin.routes["content-api"].routes.push(
		{
			method: "POST",
			path: "/users/verifyEmailOTP",
			handler: "user.verifyEmailOTP",
			config: {
				prefix: "",
			},
		},
		{
			method: "POST",
			path: "/users/resendEmailOTP",
			handler: "user.resendEmailOTP",
			config: {
				prefix: "",
			},
		},
		{
			method: "POST",
			path: "/users/sendCreds/:userId",
			handler: "user.sendCreds",
			config: {
				prefix: "",
			},
		},
		{
			method: "POST",
			path: "/auth/social",
			handler: "auth.social",
			config: {
				prefix: "",
			},
		}
	);

	return plugin;
};
