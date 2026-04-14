module.exports = ({ env }) => ({
    auth: {
        secret: env('ADMIN_JWT_SECRET', 'c39ff4b1931b33a279f2f7a60db6b7c2'),
    },
    apiToken: {
        salt: env('API_TOKEN_SALT', 'c39ff4b1931b33a279f2f7a60db6b7c2'),
    },
});
