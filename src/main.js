const fs = require('fs');
const path = require('path');

const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(bodyParser.urlencoded({
    extended: false,
}));

const Config = require('../config.js');
const { StorageBackend, Record } = require('./storage.js');

// create db if not exists
if (!fs.existsSync(Config.DATABASE)) {
    fs.mkdirSync(Config.DATABASE);
}

// cache template HTML
const TEMPLATE = fs.readFileSync('static/template.html', 'utf8');

const storage = new StorageBackend(Config.DATABASE);

const tpl = params => {
    let templateResult = TEMPLATE;
    for (const [key, value] of Object.entries(params)) {
        templateResult = templateResult.replace(`%${key}%`, value);
    }
    return templateResult;
}

app.get('/', (req, res) => {
    //> Hack to return a fancy ANSI terminal result
    //  when running $ curl linus.zone
    if (req.header('User-Agent').includes('curl/')) {
        res.set('Content-Type', 'text/plain');
        res.send(`[1mLinus Lee[0m
[33m===[0m

[34mwww:    linus.zone/now
email:  linus@thesephist.com
social: @thesephist[0m

[33m---[0m

[32mFrontend Engineer, Repl.it
    linus@repl.it

Investment Partner, Dorm Room Fund
    linus@drf.vc

Director, Cal Hacks
    linus@calhacks.io

Computer Science, UC Berkeley
    l7@berkeley.edu[0m\n`);
    } else {
        fs.readFile('static/index.html', 'utf8', (err, data) => {
            if (err) {
                throw err;
            }

            res.set('Content-Type', 'text/html');
            res.send(data);
        });
    }
});

app.post('/new', async (req, res) => {
    if (req.body.id && req.body.id.includes('.')) {
        res.status(400);
        res.set('Content-Type', 'text/plain');
        res.send('Record IDs cannot contain "."');
        return;
    }

    try {
        let canCreateRecord = false;
        if (await storage.has(req.body.id)) {
            const existingRecord = await storage.get(req.body.id);
            if (existingRecord.isLocked()) {
                if (existingRecord.canUnlockWith(req.body.password)) {
                    canCreateRecord = true;
                }
            } else {
                canCreateRecord = true;
            }
        } else {
            canCreateRecord = true;
        }

        if (canCreateRecord) {
            const record = new Record({
                id: req.body.id || undefined,
                type: req.body.content_uri ? 'uri' : 'note',
                password: req.body.password || undefined,
                content: req.body.content_uri || req.body.content_note,
            });

            if (record.isURI() && record.id === record.content) {
                res.status(409);
                res.send(`This record will create a redirect loop`);
                return;
            } else if (!record.validate()) {
                res.status(400);
                res.send(`This record is invalid`);
                return;
            }

            await storage.save(record);
            res.redirect(302, `/${record.id}`);
            console.log(`Created note ${record.id} as ${record.type}`);
        } else {
            res.status(401);
            res.set('Content-Type', 'text/plain');
            res.send(`Incorrect password: could not edit record ${req.body.id}.`);
            console.log(`Unauthorized attempt to edit ${req.body.id}`);
        }
    } catch (e) {
        res.status(500);
        res.send('');
        console.log(`Error on /new: ${e}`);
    }
});

app.get('/:id', async (req, res) => {
    res.set('Content-Type', 'text/html');

    const rid = req.params.id;
    try {
        if (await storage.has(rid)) {
            const record = await storage.get(rid);
            if (record.isNote()) {
                res.send(tpl({
                    title: record.id,
                    content: record.render(),
                }));
                console.log(`Rendered note ${record.id} as HTML`);
            } else if (record.isURI()) {
                res.redirect(302, record.getRedirect());
                console.log(`Redirected note ${record.id} to ${record.getRedirect()}`);
            }
        } else {
            res.status(404);
            res.send(`Record ${rid} does not exist.`);
        }
    } catch (e) {
        console.error(e);
    }
});

app.get('/:id/raw', async (req, res) => {
    res.set('Content-Type', 'text/plain');

    const rid = req.params.id;
    try {
        if (await storage.has(rid)) {
            const record = await storage.get(rid);
            if (record.isNote()) {
                res.send(record.getRawNote());
                console.log(`Rendered raw note for ${record.id}`);
            } else if (record.isURI()) {
                res.send(record.getRedirect());
                console.log(`Rendered raw uri for ${record.id}`);
            }
        } else {
            res.status(404);
            res.send(`Record ${rid} does not exist.`);
        }
    } catch (e) {
        console.error(e);
    }
});

app.get('/:id/content', async (req, res) => {
    res.set('Content-Type', 'application/json');

    const rid = req.params.id;
    try {
        if (await storage.has(rid)) {
            const record = await storage.get(rid);
            if (record.isNote()) {
                res.send({
                    type: 'note',
                    content: record.getRawNote(),
                });
            } else if (record.isURI()) {
                res.send({
                    type: 'uri',
                    content: record.getRedirect(),
                });
            }
        } else {
            res.send({
                type: 'none',
                content: `Record ${rid} does not exist.`
            });
        }
    } catch (e) {
        console.error(e);
    }
});

app.get('/:id/locked', async (req, res) => {
    res.set('Content-Type', 'text/plain');

    const rid = req.params.id;
    try {
        if (await storage.has(rid)) {
            const record = await storage.get(rid);
            res.send(record.isLocked() ? '1' : '0');
        } else {
            // doesn't exist, so this ID isn't locked
            res.send('0');
        }
    } catch (e) {
        res.send('0');
        console.error(e);
    }
});

app.use('/static', express.static('static'));

app.listen(
    Config.PORT,
    _ => console.log(`Zone service running on :${Config.PORT}`)
);

