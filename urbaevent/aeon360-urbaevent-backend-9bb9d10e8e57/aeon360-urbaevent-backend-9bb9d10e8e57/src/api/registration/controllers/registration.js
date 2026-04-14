"use strict";

/**
 * registration controller
 */

const utils = require("@strapi/utils");
const { ForbiddenError } = utils.errors;
const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::registration.registration", ({ strapi }) => ({
	// Blue : RGB(76, 152, 216 - #6CB537), Green(108, 181, 55 - #4C98D8)
	// var email = cryptoJS.enc.Base64.parse(encryptedEmail).toString(cryptoJS.enc.Utf8);

	async find(ctx) {
		ctx.query = { ...ctx.query, pagination: { pageSize: 999999 }, sort: { user: { company: "asc" } } };
		const registrations = await super.find(ctx);
		return registrations;
	},

	async getQRCode(ctx) {
		const { registrationId } = ctx.params;
		const fs = require("fs");
		const QRCode = require("qrcode");

		const registration = await strapi.entityService.findOne("api::registration.registration", registrationId, {
			populate: {
				user: { populate: { avatar: true, exhibitor: true } },
				event: { populate: { banner: true } },
				gate: true,
			},
		});
		if (registration) {
			// Pending eBadge
			if (registration.confirmed == null) throw new ForbiddenError("The eBadge approval is pending");

			// Rejected eBadge
			if (registration.confirmed == false) throw new ForbiddenError("The eBadge request has been rejected");

			// Create QRCode ==============================
			const QRCodeParams = {
				errorCorrectionLevel: "H",
				type: "terminal",
				quality: 0.95,
				margin: 1,
				color: { dark: "#FFFFFF", light: "#000000" },
			};
			const QRCodePath = "badges/qrcode-" + registrationId + ".png";
			const QRCodeData = registrationId + "-" + registration.event.id + "-" + registration.user.id + "-" + registration.type;
			await QRCode.toFile(QRCodePath, [{ data: QRCodeData }], QRCodeParams);

			// QRCode Download ===============================
			var QRCodeImg = fs.readFileSync(QRCodePath);
			ctx.set({
				"Content-Type": "image/png",
				"Content-Disposition": "attachment; filename = eBadge.png",
			});
			ctx.body = QRCodeImg;

			// ctx.body = {
			//     data: { QRCode: QRCodePath }
			// };

			// Remove Generated Files =====================
			// fs.unlink(QRCodePath, () => { });
		}
	},

	async downloadEbadge(ctx) {
		const { registrationId } = ctx.params;
		const fs = require("fs");
		const { jsPDF } = require("jspdf");
		const cryptoJS = require("crypto-js");
		const QRCode = require("qrcode");
		const axios = require("axios");

		const registration = await strapi.entityService.findOne("api::registration.registration", registrationId, {
			populate: {
				user: { populate: { avatar: true, exhibitor: true } },
				event: { populate: { smallBadgeBackground: true } },
				gate: true,
			},
		});
		if (registration) {
			// Pending eBadge
			if (registration.confirmed == null) throw new ForbiddenError("The eBadge approval is pending");

			// Rejected eBadge
			if (registration.confirmed == false) throw new ForbiddenError("The eBadge request has been rejected");

			// Get Fields Value ===========================
			let company = "";
			let jobPosition = "";
			let gate = "";
			let booth = "";
			let avatarURL = "";
			if (registration.type == "collaborator") {
				const exhibitorParent = await strapi.entityService.findOne("plugin::users-permissions.user", registration.user.exhibitor.id, {
					populate: {
						avatar: true,
						registrations: {
							populate: { gate: true },
							filters: { event: registration.event.id },
						},
					},
				});
				avatarURL = exhibitorParent.avatar?.url;
				company = exhibitorParent.company;
				jobPosition = registration.user.jobPosition;
				gate = exhibitorParent.registrations[0].gate?.name;
				booth = exhibitorParent.registrations[0].booth;
			} else {
				avatarURL = registration.user.avatar?.url;
				company = registration.user.company;
				jobPosition = registration.user.jobPosition;
				gate = registration.gate?.name;
				booth = registration.booth;
			}

			// PDF Doc ====================================
			const pdfDoc = new jsPDF({ format: [100, 150] });

			// pdfDoc.setTextColor(61, 67, 72);
			// pdfDoc.setDrawColor(61, 67, 72, 72);
			// pdfDoc.rect(3, 3, pdfDoc.internal.pageSize.getWidth() - 6, pdfDoc.internal.pageSize.getHeight() - 6, 'S');

			// Badge Background Img =======================
			const imgBadgeBg = await axios.get(process.env.URL + registration.event.smallBadgeBackground.url, { responseType: "arraybuffer" });
			const smallBadgeBackground = Buffer.from(imgBadgeBg.data).toString("base64");
			pdfDoc.addImage(smallBadgeBackground, "JPEG", 0, 0, 100, 150);

			// User Logo/Avatar ===========================
			if (avatarURL != undefined) {
				const image = await axios.get(process.env.URL + avatarURL, { responseType: "arraybuffer" });
				const userLogo = Buffer.from(image.data).toString("base64");
				pdfDoc.addImage(userLogo, "PNG", 79, 12, 17, 17);
			}

			/* // Event Logo =================================
            const image = await axios.get(process.env.URL + eventLogoURL, { responseType: 'arraybuffer' });
            const eventLogo = Buffer.from(image.data).toString('base64');
            pdfDoc.addImage(eventLogo, 'PNG', 36, 7, 35, 35);

            // Event Name =================================
            pdfDoc.setFontSize(20);
            pdfDoc.setFont(undefined, 'bold');
            pdfDoc.text(registration.event.name.toUpperCase(), 53, 55, { align: 'center' }); */

			// User Name ==================================
			if (registration.user.name.length <= 24) pdfDoc.setFontSize(18);
			else pdfDoc.setFontSize(12);
			pdfDoc.setFont(undefined, "bold");
			pdfDoc.text(registration.user.name.toUpperCase(), 50, 40, { align: "center" });

			// Company ====================================
			pdfDoc.setFontSize(12);
			pdfDoc.setFont(undefined, "bold");
			if (company && company.trim() != "") pdfDoc.text(company.toUpperCase(), 50, 48, { align: "center" });

			// Function ===================================
			pdfDoc.setFontSize(12);
			pdfDoc.setFont(undefined, "normal");
			if (jobPosition && jobPosition.trim() != "") pdfDoc.text(jobPosition.toUpperCase(), 50, 55, { align: "center" });

			// QRCode Image ===============================
			const QRCodeParams = {
				errorCorrectionLevel: "H",
				type: "terminal",
				quality: 0.95,
				margin: 1,
				color: { dark: "#FFFFFF", light: "#000000" },
			};
			const QRCodePath = "badges/qrcode-" + registrationId + ".png";
			const QRCodeData = registrationId + "-" + registration.event.id + "-" + registration.user.id + "-" + registration.type;
			await QRCode.toFile(QRCodePath, [{ data: QRCodeData }], QRCodeParams);
			pdfDoc.addImage(fs.readFileSync(QRCodePath).toString("base64"), "PNG", 30, 62, 40, 40);

			// User Type ==================================
			const userTypes = { visitor: "VISITEUR", exhibitor: "EXPOSANT", collaborator: "EXPOSANT" };
			pdfDoc.setFontSize(32);
			pdfDoc.setFont(undefined, "bold");
			pdfDoc.setTextColor(43, 94, 139);
			pdfDoc.text(userTypes[registration.type], 51, 122, { align: "center" });

			// Gate & Stand ===============================
			if (gate && gate.trim() != "") {
				pdfDoc.setFontSize(10);
				pdfDoc.setFont(undefined, "bold");
				pdfDoc.setTextColor(0, 0, 0);
				pdfDoc.text(gate + " - " + "STAND " + booth, 55, 162, { align: "center" });
			}

			// PDf Download ===============================
			const pdfPath = "badges/badge-" + registrationId + ".pdf";
			pdfDoc.save(pdfPath);
			var eBadgePDF = fs.readFileSync(pdfPath);
			ctx.set({
				"Content-Type": "application/pdf",
				"Content-Disposition": "attachment; filename = eBadge.pdf",
			});
			ctx.body = eBadgePDF;

			// Remove Generated Files =====================
			fs.unlink(QRCodePath, () => {});
			fs.unlink(pdfPath, () => {});
		}
	},

	async downloadEbadgeFull(ctx) {
		const { registrationId } = ctx.params;
		const fs = require("fs");
		const { jsPDF } = require("jspdf");
		const cryptoJS = require("crypto-js");
		const QRCode = require("qrcode");
		const axios = require("axios");

		// Blue : RGB(76, 152, 216 - #6CB537), Green(108, 181, 55 - #4C98D8)
		// var email = cryptoJS.enc.Base64.parse(encryptedEmail).toString(cryptoJS.enc.Utf8);

		const registration = await strapi.entityService.findOne("api::registration.registration", registrationId, {
			populate: {
				user: { populate: { avatar: true, exhibitor: true } },
				event: { populate: { logo: true, badgeBackground: true } },
				gate: true,
			},
		});
		if (registration) {
			// Pending eBadge
			if (registration.confirmed == null) throw new ForbiddenError("The eBadge approval is pending");

			// Rejected eBadge
			if (registration.confirmed == false) throw new ForbiddenError("The eBadge request has been rejected");

			// Get Fields Value ===========================
			let company = "";
			let jobPosition = "";
			let gate = "";
			let booth = "";
			let avatarURL = "";
			if (registration.type == "collaborator") {
				const exhibitorParent = await strapi.entityService.findOne("plugin::users-permissions.user", registration.user.exhibitor.id, {
					populate: {
						avatar: true,
						registrations: {
							populate: { gate: true },
							filters: { event: registration.event.id },
						},
					},
				});
				avatarURL = exhibitorParent.avatar?.url;
				company = exhibitorParent.company;
				jobPosition = registration.user.jobPosition;
				gate = exhibitorParent.registrations[0]?.gate?.name;
				booth = exhibitorParent.registrations[0]?.booth;
			} else {
				avatarURL = registration.user.avatar?.url;
				company = registration.user.company;
				jobPosition = registration.user.jobPosition;
				gate = registration.gate?.name;
				booth = registration.booth;
			}

			// PDF Doc ====================================
			const pdfDoc = new jsPDF();

			// Badge Background Img =======================
			const imgBadgeBg = await axios.get(process.env.URL + registration.event.badgeBackground.url, { responseType: "arraybuffer" });
			const badgeBackground = Buffer.from(imgBadgeBg.data).toString("base64");
			pdfDoc.addImage(badgeBackground, "JPEG", 0, 0, 210, 297);

			// User Logo/Avatar ===========================
			if (avatarURL != undefined) {
				const image = await axios.get(process.env.URL + avatarURL, { responseType: "arraybuffer" });
				const userLogo = Buffer.from(image.data).toString("base64");
				pdfDoc.addImage(userLogo, "PNG", 82, 12, 17, 17);
			}

			// User Name ==================================
			if (registration.user.name.length <= 24) pdfDoc.setFontSize(18);
			else pdfDoc.setFontSize(12);
			pdfDoc.setFont(undefined, "bold");
			pdfDoc.text(registration.user.name.toUpperCase(), 55, 40, { align: "center" });

			// User Job ===================================
			pdfDoc.setFontSize(12);
			pdfDoc.setFont(undefined, "normal");
			if (jobPosition && jobPosition.trim() != "") pdfDoc.text(jobPosition.toUpperCase(), 55, 48, { align: "center" });

			// User Company ===============================
			pdfDoc.setFontSize(12);
			pdfDoc.setFont(undefined, "bold");
			if (company && company.trim() != "") pdfDoc.text(company.toUpperCase(), 55, 55, { align: "center" });

			// QRCode Image ===============================
			const QRCodeParams = {
				errorCorrectionLevel: "H",
				type: "terminal",
				quality: 0.95,
				margin: 1,
				color: { dark: "#FFFFFF", light: "#000000" },
			};
			const QRCodePath = "badges/qrcode-" + registrationId + ".png";
			const QRCodeData = registrationId + "-" + registration.event.id + "-" + registration.user.id + "-" + registration.type;
			await QRCode.toFile(QRCodePath, [{ data: QRCodeData }], QRCodeParams);
			pdfDoc.addImage(fs.readFileSync(QRCodePath).toString("base64"), "PNG", 35, 62, 40, 40);

			// User Type ==================================
			const userTypes = { visitor: "VISITEUR", exhibitor: "EXPOSANT", collaborator: "EXPOSANT" };
			pdfDoc.setFontSize(32);
			pdfDoc.setFont(undefined, "bold");
			pdfDoc.setTextColor(43, 94, 139);
			pdfDoc.text(userTypes[registration.type], 57, 122, { align: "center" });

			// Gate & Stand ===============================
			if (gate && gate.trim() != "") {
				pdfDoc.setFontSize(10);
				pdfDoc.setFont(undefined, "bold");
				pdfDoc.setTextColor(0, 0, 0);
				pdfDoc.text(gate + " - " + "STAND " + booth, 55, 132, { align: "center" });
			}

			// PDf Download ===============================
			const pdfPath = "badges/badge-" + registrationId + ".pdf";
			pdfDoc.save(pdfPath);
			var eBadgePDF = fs.readFileSync(pdfPath);
			ctx.set({
				"Content-Type": "application/pdf",
				"Content-Disposition": "attachment; filename = Badge.pdf",
			});
			ctx.body = eBadgePDF;

			// Remove Generated Files =====================
			fs.unlink(QRCodePath, () => {});
			fs.unlink(pdfPath, () => {});
		}
	},

	async sendEmailEBadge(ctx) {
		const { registrationId } = ctx.params;
		const registration = await strapi.entityService.findOne("api::registration.registration", registrationId, {
			populate: { user: true, event: true },
		});
		if (registration) {
			const update = await strapi.entityService.update("api::registration.registration", registrationId, { data: { emailBadgeSent: true } });
			if (update != null) {
				const templateId = registration.type == "visitor" ? 25 : 22;
				strapi.service("api::brevo.brevo").sendEmail(templateId, registration.user.email, {
					nom: registration.user.name,
					event: registration.event.name,
					eventDate: registration.event.dateString,
					eventLocation: registration.event.locationAddress,
					urlToBadge: process.env.URL + "/api/registrations/downloadEbadgeFull/" + registrationId,
				});
				ctx.send({ data: true });
			}
		}
	},
}));
