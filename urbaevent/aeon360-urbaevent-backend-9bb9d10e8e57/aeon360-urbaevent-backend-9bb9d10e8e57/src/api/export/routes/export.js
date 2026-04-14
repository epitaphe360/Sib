module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/export/excel/:collection',
            handler: 'export.excel',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
