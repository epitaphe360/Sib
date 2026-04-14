module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/registrations/getQRCode/:registrationId',
            handler: 'registration.getQRCode',
        },
        {
            method: 'GET',
            path: '/registrations/downloadEbadge/:registrationId',
            handler: 'registration.downloadEbadge',
        },
        {
            method: 'GET',
            path: '/registrations/downloadEbadgeFull/:registrationId',
            handler: 'registration.downloadEbadgeFull',
        },
        {
            method: 'POST',
            path: '/registrations/sendEmailEBadge/:registrationId',
            handler: 'registration.sendEmailEBadge',
        },
    ]
}
