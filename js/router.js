app.router = {
    pagesPath: '/pages',
    containerElement: $('#component-container'),
    element: '#component-container_content',
    defaultReturnLink: '#/post/list',
    settingsLink: '#/settings',
    reloadPage() {
        const oldHash = location.hash;

        location.hash = '#';
        location.hash = oldHash;
    },
    async displayError(detail, errorType, proxyTipEnabled) {
        app.loader.set('disabled');

        while ($(this.element).firstChild)
            $(this.element).firstChild.remove();

        switch (errorType) {
            case 'notFound':
                const errorHeading = document.createElement('h3');
                errorHeading.innerText = i18n.tr('router_page-not-found');

                $(this.element).append(errorHeading);
                break;

            case 'htmxError':
                const eventDetail = detail.detail;

                const htmxErrorHeading = document.createElement('h3');
                htmxErrorHeading.innerText = i18n.tr('generic-error');

                // error desc
                const error = eventDetail?.errorInfo?.error ?? eventDetail.error;
                const requestPath = eventDetail.errorInfo?.pathInfo?.requestPath ?? eventDetail?.pathInfo?.requestPath;

                const htmxErrorDesc = document.createElement('p');
                htmxErrorDesc.className = 'small';
                htmxErrorDesc.innerText = `${error}: request to ${requestPath}`;

                $(this.element).append(htmxErrorHeading);
                $(this.element).append(htmxErrorDesc);
                break;

            default:
                const customErrorHeading = document.createElement('h3');
                customErrorHeading.innerText = i18n.tr('generic-error');

                // error desc
                const errorDesc = document.createElement('p');
                errorDesc.className = 'small';
                errorDesc.innerText = detail;

                $(this.element).append(customErrorHeading);
                $(this.element).append(errorDesc);
                break;
        }

        // proxy enabling tip
        if (proxyTipEnabled) {
            const proxyTip = document.createElement('p');
            proxyTip.className = 'small';
            proxyTip.innerHTML = i18n.tr('router_page-proxytip');
            $(this.element).append(proxyTip);
        }

        // return link
        const errorLink = document.createElement('a');
        errorLink.className = 'small';
        errorLink.innerText = i18n.tr('generic_return-back');
        errorLink.href = this.defaultReturnLink;

        $(this.element).append(errorLink);
    },
    async handleHashChange(event) {
        if (event.newURL === '/' || location.hash === event.oldURL.split('#')[1]) return;

        app.logger.log(`navigating to "${decodeURIComponent(location.hash)}" (isTrusted: ${event.isTrusted})`, 'giboru/router.handleHashChange');
        await this.load(this.getPagePath(), this.getPageParams() ?? false);
    },
    getPageHash() {
        const hash = location.hash.slice(1);

        return hash;
    },
    getPagePath() {
        const path = location.hash;

        if (path) {
            // Remove the leading '#'
            const hash = location.hash.slice(1);

            return hash.split('&')[0] ?? null;
        }
    },
    getPageParams() {
        const path = location.hash;

        if (path) {
            // Remove the leading '#'
            const hash = location.hash.slice(1);

            // Split and get the params
            const params = hash.split('&')[1] ?? null;

            return JSON.parse(decodeURIComponent(params));
        }
    },
    async setup() {
        this.containerElement.addEventListener('htmx:load', async () => {
            // hide the loader on successful load
            app.loader.set('disabled');
        });

        // script error
        document.body.addEventListener('htmx:error', async (event) => {
            await this.displayError(event, 'htmxError', true);
        });

        // just an 404 error
        document.body.addEventListener('htmx:responseError', async (event) => {
            await this.displayError(event, 'notFound');
        });
    },
    async load(pageName, params) {
        if (!pageName)
            return app.logger.error('no `pageName` provided', 'giboru/router.load');

        // hiding menu on page load
        $('#header_menu').hidden = true;

        app.logger.log(`loading page "${pageName}", params: ${JSON.stringify(this.getPageParams()) ?? null}`, 'giboru/router.load');

        app.loader.set('active');

        if (params) {
            location.hash = `${pageName}&${JSON.stringify(params)}`;
        } else {
            location.hash = pageName;
        }

        htmx.ajax('GET', `${this.pagesPath}/${pageName}.html`, { target: this.element });
    }
}
