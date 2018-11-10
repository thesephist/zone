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
    fs.readFile('static/index.html', 'utf8', (err, data) => {
        if (err) {
            throw err;
        }

        res.set('Content-Type', 'text/html');
        res.send(data);
    });
});

app.post('/new', async (req, res) => {
    try {
        const record = new Record({
            id: req.body.id || undefined,
            type: req.body.content_uri ? 'uri' : 'note',
            content: req.body.content_uri || req.body.content_note,
        });

        if (record.isURI() && record.id === record.content) {
            res.status(409);
            res.send(`This record will create a redirect loop!`);
            return;
        } else if (!record.validate()) {
            res.status(400);
            res.send(`This record is invalid!`);
            return;
        }

        try {
            await storage.save(record);
            res.redirect(302, `/${record.id}`);
            console.log(`Created note ${record.id} as ${record.type}`);
        } catch (e) {
            console.error(e);
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

app.use('/static', express.static('static'));

app.listen(
    Config.PORT,
    _ => console.log(`Zone service running on :${Config.PORT}`)
);

