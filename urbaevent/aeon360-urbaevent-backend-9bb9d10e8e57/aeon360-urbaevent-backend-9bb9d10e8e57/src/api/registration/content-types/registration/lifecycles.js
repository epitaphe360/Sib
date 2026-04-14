const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

module.exports = {
	async beforeCreate(event) {
		let { data } = event.params;

		// Added from Admin Panel =============================================
		if (data.event.connect) {
			if (data.conference.connect[0] == undefined) {
				const entries = await strapi.entityService.findMany("api::registration.registration", {
					filters: { user: data.user.connect[0].id, event: data.event.connect[0].id },
				});
				if (entries.length > 0) throw new ApplicationError("User already registered to this event");
			} else {
				const entries = await strapi.entityService.findMany("api::registration.registration", {
					filters: { user: data.user.connect[0].id, conference: data.conference.connect[0].id },
				});
				if (entries.length > 0) throw new ApplicationError("User already registered to this conference");
			}
		}
		// Added from App =============================================
		else {
			if (!data.conference) {
				const entries = await strapi.entityService.findMany("api::registration.registration", {
					filters: { user: data.user, event: data.event },
				});
				if (entries.length > 0) throw new ApplicationError("User already registered to this event");
			} else {
				const entries = await strapi.entityService.findMany("api::registration.registration", {
					filters: { user: data.user, conference: data.conference },
				});
				if (entries.length > 0) throw new ApplicationError("User already registered to this conference");
			}
		}
	},
};
