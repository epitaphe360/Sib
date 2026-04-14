import AuthLogo from './extensions/logo.png';
import MenuLogo from './extensions/logo.png';
import favicon from './extensions/favicon.ico';
import SendEbadge from './extensions/SendEbadge';
import SendCreds from './extensions/SendCreds';
import ExcelExport from './extensions/ExcelExport';

const config = {
    auth: {
        logo: AuthLogo
    },
    menu: {
        logo: MenuLogo
    },
    head: {
        favicon: favicon,
    },
    tutorials: false,
    notifications: {
        release: false
    },
    locales: ['fr'],
};

const bootstrap = app => {
    console.log(app);
};

export default {
    config,
    bootstrap(app) {
        app.injectContentManagerComponent('editView', 'right-links', {
            name: 'SendEbadge',
            Component: SendEbadge,
        });
        app.injectContentManagerComponent('editView', 'right-links', {
            name: 'SendCreds',
            Component: SendCreds,
        });
        app.injectContentManagerComponent('listView', 'actions', {
            name: 'ExcelExport',
            Component: ExcelExport,
        });
    },
};
