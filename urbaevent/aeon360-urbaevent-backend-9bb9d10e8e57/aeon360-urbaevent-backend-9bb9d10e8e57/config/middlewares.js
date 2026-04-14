module.exports = [
	"strapi::errors",
	"strapi::security",
	"strapi::cors",
	/* {
		name: "strapi::cors",
		config: {
			origin: ["https://app.urbaevent.ma", "https://www.app.urbaevent.ma", "https://www.btp-expo.ma", "https://btp-expo.ma"],
			methods: ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
			headers: ["*"],
			keepHeaderOnError: true,
		},
	}, */
	"strapi::poweredBy",
	"strapi::logger",
	"strapi::query",
	"strapi::body",
	"strapi::session",
	"strapi::favicon",
	"strapi::public",
];
