app.init = async () => {
    i18n.tr('header-go-back_button-text', {
        elem: '#header_go-back-button-text',
        attr: 'innerText'
    });

    // translating main menu items
    i18n.tr('header-menu-router_load-settings', {
        elem: '#header-menu-router_load-settings',
        attr: 'innerText'
    });

    i18n.tr('header-menu-localStorage_clear', {
        elem: '#header-menu-localStorage_clear',
        attr: 'innerText'
    });

    i18n.tr('header-menu-router_reload-page', {
        elem: '#header-menu-router_reload-page',
        attr: 'innerText'
    });

    i18n.tr('header-menu-router_load-mainpage', {
        elem: '#header-menu-router_load-mainpage',
        attr: 'innerText'
    });


    app.logger.log('proxy setup', 'giboru/app.init');
    await app.booru.proxy.setup();

    app.logger.log('set proxy state', 'giboru/app.init');
    if (!localStorage.getItem(app.booru.proxy.dbname)) {
        localStorage.setItem(app.booru.proxy.dbname, '');
        await app.booru.proxy.setState(false);
    }

    app.logger.log('initDatabase', 'giboru/app.init');
    await app.booru.db.init();

    app.logger.log('loadBoorus', 'giboru/app.init');
    await app.booru.db.loadBoorus();

    app.logger.log('router setup', 'giboru/app.init');
    await app.router.setup();

    app.logger.log('hashChange handler setup', 'giboru/app.init');
    window.onhashchange = async (e) =>
        await app.router.handleHashChange(e);

    // adding some boorus at first app launch
    if (Object.keys(app.booru.db.getDB()).length === 0) {
        const booruProfiles = app.booru.db.booruProfiles;

        const safebooruProfile = booruProfiles.find(profile => profile.name === 'Safebooru');
        await app.booru.db.add(safebooruProfile);
    }
}

(async () => {
    app.logger.log('i18n prepareStrings', 'giboru/app.init');
    await i18n.prepareStrings();

    await app.init()
        .then(async () => {
            if (app.router.getPagePath())
                await app.router.load(app.router.getPagePath(), app.router.getPageParams() ?? false);
            else
                await app.router.load('/post/list');
        });
})();

