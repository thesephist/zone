const fs = require('fs');
const path = require('path');

const marked = require('marked');
const { randid, validid } = require('./utils.js');

class StorageBackend {

    constructor(dirpath) {
        this.dirpath = dirpath;
    }

    pathFromID(id) {
        return path.join(this.dirpath, id);
    }

    has(id) {
        return new Promise((res, rej) => {
            fs.access(
                this.pathFromID(id),
                fs.constants.F_OK,
                err => {
                    res(!err);
                }
            );
        }).catch(e => console.error(e));
    }

    get(id) {
        return new Promise((res, rej) => {
            fs.readFile(
                this.pathFromID(id),
                'utf8',
                (err, data) => {
                    if (err) {
                        rej(err);
                    } else {
                        res(Record.parse(data));
                    }
                });
        }).catch(e => console.error(e));
    }

    save(record) {
        return new Promise((res, rej) => {
            fs.writeFile(
                this.pathFromID(record.id),
                record.serialize(),
                'utf8',
                (err) => {
                    if (err) {
                        rej(err);
                    } else {
                        res();
                    }
                }
            )
        }).catch(e => console.error(e));
    }

}

class Record {

    constructor({
        id = randid(),
        type = 'note',
        content = '',
    }) {
        this.id = id.trim();
        this.type = type;
        this.content = content.trim();
    }

    isURI() {
        return this.type === 'uri';
    }

    isNote() {
        return this.type === 'note';
    }

    validate() {
        const VALID_TYPES = [
            'uri',
            'note',
        ];

        return [
            validid(this.id),
            VALID_TYPES.includes(this.type),
            this.content !== '',
        ].every(x => x);
    }

    render() {
        if (!this.isNote()) {
            throw new Error(`Cannot render a record of type ${this.type}`);
        }

        return marked(this.content);
    }

    getRawNote() {
        if (!this.isNote()) {
            throw new Error(`Cannot get raw note of a record of type ${this.type}`);
        }

        return this.content;
    }

    getRedirect() {
        if (!this.isURI()) {
            throw new Error(`Cannot render a redirect path for record of type ${this.type}`);
        }

        return this.content;
    }

    serialize() {
        return `${this.type}.${this.id}\n${this.content}`;
    }

    static parse(data) {
        const [firstline, ...contentLines] = data.split('\n');
        const [type, id] = firstline.split('.');
        return new Record({
            id: id,
            type: type,
            content: contentLines.join('\n'),
        });
    }

}

module.exports = {
    StorageBackend,
    Record,
}

