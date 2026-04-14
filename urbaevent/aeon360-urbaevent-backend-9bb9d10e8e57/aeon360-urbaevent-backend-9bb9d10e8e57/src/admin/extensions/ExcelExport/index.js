import React from 'react';
import { Button } from '@strapi/design-system/Button';
import { useIntl } from 'react-intl';
import { Download } from '@strapi/icons';

const ExcelExport = () => {
    const { formatMessage } = useIntl();
    var collection = '';
    const url = window.location.href;
    if (url.indexOf('collectionType/plugin::users-permissions.user') !== -1)
        collection = 'users';
    else if (url.indexOf('collectionType/api::scan-controller.scan-controller') !== -1)
        collection = 'scans-controllers';
    else if (url.indexOf('collectionType/api::registration.registration') !== -1)
        collection = 'registrations';
    else
        return <></>;

    const onExcelExport = async () => {
        location.href = process.env.STRAPI_ADMIN_BACKEND_URL + '/api/export/excel/' + collection;
    };

    return (
        <>
            <Button startIcon={<Download />} onClick={onExcelExport}>
                {formatMessage({
                    id: 'components.ExcelExport.button',
                    defaultMessage: 'Exporter en Excel',
                })}
            </Button>
        </>
    );
};

export default ExcelExport;
