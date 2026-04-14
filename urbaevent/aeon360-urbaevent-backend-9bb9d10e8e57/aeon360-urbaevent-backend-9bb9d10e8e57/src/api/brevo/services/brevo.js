'use strict';

/**
 * brevo service
 */


module.exports = () => ({

    async sendEmail(templateId, to, params) {
        const brevoApiV3Sdk = require('sib-api-v3-sdk');
        brevoApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

        await new brevoApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
            'templateId': templateId,
            'to': [{ 'email': to }],
            'params': params
        }).then(
            data => { }
        ).catch(
            error => {
                console.log('========== sendEmail Error ==========');
                console.log(error);
            }
        );
    },

    async createContact(params) {

    }

});
