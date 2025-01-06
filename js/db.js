Object.assign(app.booru, {
    setDefault(booruName) {
        if (!booruName)
            return app.logger.error(`no booruName provided`, 'giboru/booru.setDefault');

        // for local boorus object
        const booru = this.db.booruList[booruName];
        
        if (booru) {
            // localStorage
            const db = this.db.booruList;
            for (const key in db) {
                if (db[key].default) {
                    // making default booru not default
                    db[key].default = false;
                }
            }

            booru.default = true;

            // writing new booru to localStorage
            Object.assign(db, { [booru.name]: booru });
            localStorage.setItem(this.db.name, JSON.stringify(db));

            return booru.default;
        } else {
            app.logger.error(`booru "${booruName}" doesn't exist`, 'giboru/booru.setDefault');
            return false;
        }
    },
    getDefault() {
        // localStorage and booruList are synced (at least, must be),
        // so we can just return booru from our local list
        const db = this.db.booruList;

        for (const key in db) {
            if (db[key].default) {
                return db[key]; // Return the default booru object
            }
        }

        return null; // Return null if no default booru is found
    },
    db: {
        name: 'giboru-boorudb',
        booruList: {},
        booruProfiles: [
            {
                name: 'Gelbooru',
                default: true,
                baseURL: 'https://gelbooru.com/index.php?',
                engine: 'gelbooru',
                keys: {
                    tags: 'tags',
                    imagePreview: 'preview_url',
                    imageOriginal: 'file_url',
                    imageSample: 'sample_url',
                    imageIsSample: 'sample',
                    postAuthor: 'owner',
                    postRating: 'rating',
                    postScore: 'score',
                    postUploadTime: 'change',
                    posts: 'post'
                },
                api: {
                    search: 'page=dapi&s=post&q=index&json=1&pid=%{page}&limit=%{limit}&tags=%{query}',
                    getPost: '%{posts}&id=%{id}',
                    getTags: '%{tags}&id=%{id}',
                    posts: 'page=dapi&s=post&q=index&json=1', // need to add "&tags="
                    comments: 'page=dapi&s=comment&q=index&json=1', // need to add "&post_id="
                    tags: 'page=dapi&s=tag&q=index&json=1' // need to add "&id="
                }
            },
            {
                name: 'Safebooru',
                default: true,
                baseURL: 'https://safebooru.org/index.php?',
                engine: 'safebooru',
                keys: {
                    tags: 'tags',
                    imagePreview: 'preview_url',
                    imageOriginal: 'file_url',
                    imageSample: 'sample_url',
                    imageIsSample: 'sample',
                    postAuthor: 'owner',
                    postRating: 'rating',
                    postScore: 'score',
                    postUploadTime: 'change'
                },
                api: {
                    search: 'page=dapi&s=post&q=index&json=1&pid=%{page}&limit=%{limit}&tags=%{query}',
                    getPost: '%{posts}&id=%{id}',
                    getTags: '%{tags}&id=%{id}',
                    posts: 'page=dapi&s=post&q=index&json=1', // need to add "&tags="
                    comments: 'page=dapi&s=comment&q=index&json=1', // need to add "&post_id="
                    tags: 'page=dapi&s=tag&q=index&json=1' // need to add "&id="
                }
            },
            {
                name: 'Danbooru',
                default: false,
                baseURL: 'https://danbooru.donmai.us',
                engine: 'danbooru',
                keys: {
                    tags: 'tag_string',
                    tagArtist: 'tag_string_artist',
                    tagCopyright: 'tag_string_copyright',
                    tagCharacters: 'tag_string_character',
                    tagMeta: 'tag_string_meta',
                    tagGeneral: 'tag_string_general',
                    imagePreview: 'preview_file_url',
                    imageOriginal: 'file_url',
                    imageSample: 'large_file_url',
                    imageIsSample: 'has_large',
                    postAuthor: 'tag_string_artist',
                    postRating: 'rating',
                    postScore: 'score',
                    postUploadTime: 'updated_at',
                },
                api: {
                    search: '/posts.json?tags=%{query}&limit=%{limit}&page=%{page}', // need to wrap all that strings to app.booru.proxy.asProxy() and formatTemplate()
                    getPost: '/posts/%{id}.json',
                    getTags: '%{tags}',
                    posts: '/posts.json',
                    comments: undefined,
                    tags: '/tags.json',
                }
            }
        ],
        getDB() {
            const data = localStorage.getItem(this.name);
            return data ? JSON.parse(data) : {};
        },
        async init() {
            const booruDB = localStorage.getItem(this.name);
            if (!booruDB) {
                app.logger.info("booru database isn't created yet, creating one", 'giboru/booru.db.init');
                localStorage.setItem(this.name, '{}');
            }
        },
        async loadBoorus() {
            const boorus = this.getDB();

            Object.values(boorus)
                .forEach(booru => {
                    Object.assign(this.booruList, { [booru.name]: booru });
                });
        },
        async add(booruObject) {
            if (typeof booruObject !== 'object')
                return app.logger.error(`booruObject must be "object", received "${typeof booruObject}"`, 'giboru/booru.db.add');

            if (!booruObject.name)
                return app.logger.error('can\'t add booru without a name', 'giboru/booru.db.add');

            // checking if this booru already exists
            const booru = this.booruList[booruObject.name]; // this.booruList is just a JS object, synced with localStorage parsed object
            if (!booru) {
                const localStorageDB = this.getDB(); // returning already parsed JSON from localStorage

                Object.assign(localStorageDB, { [booruObject.name]: booruObject });

                // Save the updated object back to localStorage as a string
                localStorage.setItem(this.name, JSON.stringify(localStorageDB));

                // Also update the object in JavaScript
                Object.assign(this.booruList, { [booruObject.name]: booruObject });

                app.logger.info(`added new booru: "${booruObject.name}"`, 'giboru/booru.db.add');
            } else {
                return app.logger.error(`booru with name "${booru.name}" already exists`, 'giboru/booru.db.add');
            }
        },
        async remove(booruName) {
            if (!booruName) {
                return app.logger.error(`booruName must be a string, received "${typeof booruName}"`, 'giboru/booru.db.remove');
            }

            const boorus = this.getDB();

            for (const key in boorus) {
                if (boorus[key].name === booruName) {
                    delete this.booruList[boorus[key].name];

                    delete boorus[key]; // remove the key from the object
                    app.logger.info(`removed booru "${booruName}"`, 'giboru/booru.db.remove');
                    // Update localStorage after removing the booru
                    localStorage.setItem(this.name, JSON.stringify(boorus));
                    return;
                }
            }

            if (this.booruList.length === 1) {
                this.booruList[0].default = true;
            }

            app.logger.error(`booru "${booruName}" not found`, 'giboru/booru.db.remove');
        }
    }
});
