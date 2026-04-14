import React from 'react';
import { Button } from '@strapi/design-system/Button';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';
import { useIntl } from 'react-intl';
import Attachment from '@strapi/icons/Attachment';
import Mail from '@strapi/icons/Mail';
import axios from 'axios';


const SendEbadge = () => {
    const { formatMessage } = useIntl();
    const { modifiedData, layout } = useCMEditViewDataManager();
    const allowedTypes = ['registration'];
    if (!allowedTypes.includes(layout.apiID)) { return <></>; }

    const onSendEmailBadge = async () => {
        await axios.post(process.env.STRAPI_ADMIN_BACKEND_URL + '/api/registrations/sendEmailEBadge/' + modifiedData.id, null).then(response => {
            console.log(response);
        });
        alert('Badge envoyé par email avec succés');
    };

    const onDownloadBadge = async () => {
        location.href = process.env.STRAPI_ADMIN_BACKEND_URL + '/api/registrations/downloadEbadgeFull/' + modifiedData.id;
    };

    return (
        <>
            <Button variant="primary" size="L" fullWidth startIcon={<Mail />} onClick={onSendEmailBadge} style={{ margin: '5px 0px 0px' }}>
                {formatMessage({
                    id: 'components.SendEbadge.button',
                    defaultMessage: 'Envoyer le Badge par Email',
                })}
            </Button>
            <Button variant="primary" size="L" fullWidth startIcon={<Attachment />} onClick={onDownloadBadge} style={{ margin: '5px 0px 20px' }}>
                {formatMessage({
                    id: 'components.DownloadEbadge.button',
                    defaultMessage: 'Télécharger le Badge',
                })}
            </Button>
        </>
    );
};

export default SendEbadge;
