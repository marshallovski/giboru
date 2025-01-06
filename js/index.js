function $(elem) {
  return document.querySelector(elem);
}

const app = {
  loader: {
    element: $('#component-loader'),
    set(state) {
      if (state === 'active') {
        app.loader.element.hidden = false;
      } else if (state === 'disabled') {
        app.loader.element.hidden = true;
      }
    }
  },
  logger: {
    log(text, invoker = 'unknownInvoker') {
      console.log(`%c[${invoker}]:`, 'color: #999;', text);
    },
    error(text, invoker = 'unknownInvoker') {
      console.error(`%c[${invoker}]:`, 'color: red;', text);
    },
    info(text, invoker = 'unknownInvoker') {
      console.info(`%c[${invoker}]:`, 'color: #5B96D5;', text);
    },
    warn(text, invoker = 'unknownInvoker') {
      console.warn(`%c[${invoker}]:`, 'color: yellow;', text);
    }
  },
  booru: {
    proxy: {},
    db: {},
  },
  router: {},
  async loadScripts() {
    const scripts = [
      'js/translate.js',
      'js/db.js',
      'js/router.js',
      'js/init.js',
      'js/lib/sweetalert2.all.min.js',
      'js/utils/formatTemplate.js'
    ];

    scripts.forEach(async script => {
      const scriptElem = document.createElement('script');
      scriptElem.src = script;

      $('#scripts').append(scriptElem);
    });
  }
};

app.booru.proxy = {
  dbname: 'giboru.booru.proxy-enabled',
  urlDb: 'giboru.booru.proxy-url',
  url() {
    return localStorage.getItem(this.urlDb);
  },
  getState() {
    return localStorage.getItem(this.dbname) === 'true' ?? false;
  },
  async setup() {
    // if proxy url is empty and proxy isn't enabled
    if (!this.url() && !this.getState()) {
      localStorage.setItem(this.urlDb, '');
    }
  },
  async setState(state) {
    if (state) {
      localStorage.setItem(this.dbname, 'true');
    } else {
      localStorage.setItem(this.dbname, 'false');
    }
  },
  asProxy(url, includeBaseURL) {
    if (!url)
      return app.logger.error('no url provided');

    if (this.getState()) {
      return `${this.url()}${includeBaseURL ? encodeURIComponent(app.booru.getDefault().baseURL) : ''}${encodeURIComponent(url)}`;
    } else {
      return app.booru?.getDefault()?.baseURL;
    }
  }
};

// header menu

(async () => {
  // simple menu toggle
  $('#header_menu-opener').onclick = async () => $('#header_menu').hidden = !$('#header_menu').hidden;

  // functionality of header items
  const headerItems = {
    "header-menu-router_load-settings": {
      exec() {
        location.hash = app.router.settingsLink;
      }
    },
    "header-menu-router_reload-page": {
      exec() {
        app.router.reloadPage();
      }
    },
    "header-menu-router_load-mainpage": {
      exec() {
        location.hash = app.router.defaultReturnLink;
      }
    },
    "header-menu-localStorage_clear": {
      async exec() {
        await Swal.fire({
          title: i18n.tr('header-menu_clearStorage-dialog_title'),
          text: i18n.tr('header-menu_clearStorage-dialog_desc'),
          icon: 'question',
          confirmButtonText: i18n.tr('dialog-option_confirm'),
          cancelButtonText: i18n.tr('dialog-option_cancel'),
          showCloseButton: true,
          focusCancel: true,
          showCancelButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.clear();
            location.reload();
          }
        });
      }
    }
  };

  // applying action for each menu item
  $('#header_menu-select').onchange = async () => {
    const selectedItem = $('#header_menu-select').value;

    // if item found, execute
    if (headerItems[selectedItem]) {
      headerItems[selectedItem].exec();

      // making select usable again
      $('#header_menu-select').value = 'invalid';
    }
  }
})();

document.addEventListener('DOMContentLoaded', async () => {
  await app.loadScripts();
});