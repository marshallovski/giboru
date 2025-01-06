const i18n = {
    strings: {},
    languages: [
        {
            code: 'en-US',
            name: 'English'
        },
        {
            code: 'uk-UA',
            name: 'Українська (Ukrainian)'
        }
    ],
    async prepareStrings() {
        const selectedLanguage = localStorage.getItem('giboru-language');
        if (!selectedLanguage) localStorage.setItem('giboru-language', 'en-US');

        const response = await fetch(`/i18n/${selectedLanguage}.json`);

        if (!response.ok)
            return new Error(`[giboru/translate.prepareStrings]: HTTP error! status: ${response.status}`);

        const strings = await response.json();
        i18n.strings = strings;

        document.documentElement.lang = selectedLanguage;
    },
    async translateSector(sectorElem) {
        const elems = document.querySelectorAll(`${sectorElem} [data-i18n-key]`);

        elems.forEach(elem => {
            elem.innerText = i18n.tr(elem.getAttribute('data-i18n-key'));
        });
    },
    tr(token, elemTranslate) {
        if (!token) return '';

        const translation = i18n.strings?.tokens?.[token] ?? token;

        if (elemTranslate) {
            const elem = elemTranslate.elem;
            const attr = elemTranslate.attr;

            switch (attr) {
                case 'placeholder':
                    document.querySelector(elem).placeholder = translation;
                    break;

                case 'innerText':
                    document.querySelector(elem).innerText = translation;
                    break;

                default:
                    document.querySelector(elem).innerText = translation;
                    break;
            }
        } else {
            return translation;
        }
    }
}