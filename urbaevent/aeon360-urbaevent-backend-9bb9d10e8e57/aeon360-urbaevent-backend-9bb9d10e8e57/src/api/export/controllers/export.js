"use strict";

/**
 * A set of functions called "actions" for `excel-export`
 */

module.exports = {
	excel: async (ctx, next) => {
		const xlsx = require("xlsx");
		const fs = require("fs");

		let res;
		const collection = ctx.params.collection;
		if (collection == "users") {
			res = await strapi.entityService.findMany("plugin::users-permissions.user", {
				fields: ["id", "name", "email", "phone", "company", "jobPosition", "confirmed", "createdAt"],
				filters: { role: 1 },
				sort: { id: "desc" },
			});
		} else if (collection == "scans-controllers") {
			res = [];
			const rows = await strapi.entityService.findMany("api::scan-controller.scan-controller", {
				populate: { event: true, user: true },
				sort: { id: "desc" },
			});
			rows.forEach((e) => {
				if (e.user != null) res.push({ id: e?.id, event: e.event.name, userId: e.user?.id, name: e.user.name, email: e.user.email, createdAt: e.createdAt });
			});
		} else if (collection == "registrations") {
			res = [];
			const rows = await strapi.entityService.findMany("api::registration.registration", {
				populate: { event: true, user: true },
				filters: { conference: { id: { $null: true } } },
				sort: { id: "desc" },
			});
			rows.forEach((e) => {
				res.push({ id: e?.id, event: e.event?.name, userId: e.user?.id, name: e.user?.name, email: e.user?.email, type: e.type, confirmed: e.confirmed, createdAt: e.createdAt });
			});
		}

		const fileName = collection + ".xlsx";
		const ws = xlsx.utils.json_to_sheet(res);
		const wb = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
		xlsx.writeFile(wb, fileName);
		var contactFile = fs.readFileSync(fileName);
		ctx.set({
			"Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"Content-Disposition": "attachment; filename=" + fileName,
		});
		ctx.body = contactFile;
		fs.unlink(fileName, () => {});
	},
};
