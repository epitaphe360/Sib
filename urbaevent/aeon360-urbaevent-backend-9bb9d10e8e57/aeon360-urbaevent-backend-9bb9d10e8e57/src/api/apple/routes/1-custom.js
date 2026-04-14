module.exports = {
	routes: [
		{
			method: "GET",
			path: "/apples/:socialId",
			handler: "apple.findOne",
		},
		{
			method: "PUT",
			path: "/apples/:socialId",
			handler: "apple.update",
		},
	],
};
