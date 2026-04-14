module.exports = () => ({
    ckeditor: true,
    transformer: {
        enabled: true,
        config: {
            responseTransforms: {
                removeAttributesKey: true,
                removeDataKey: true,
            },
            /* requestTransforms: {
                wrapBodyWithDataKey: true
            }, */
        }
    },
    'users-permissions': {
        config: {
            jwt: {
                expiresIn: '365d',
            },
        },
    },
    /* email: {
        config: {
            provider: 'nodemailer',
            providerOptions: {
                host: 'smtp.gmail.com',
                port: 587,
                auth: {
                    user: 'khassouani.rachid@gmail.com',
                    pass: 'hqqxxsbobdmsdsou',
                },
            },
            settings: {
                defaultFrom: 'khassouani.rachid@gmail.com',
                defaultReplyTo: 'khassouani.rachid@gmail.com',
            },
        },
    }, */
    /* upload: {
        config: {
            breakpoints: {
                xlarge: 1920,
                large: 1000,
                medium: 750,
                small: 500,
                xsmall: 64
            },
        },
    }, */
});
