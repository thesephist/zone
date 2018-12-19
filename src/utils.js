const path = require('path');
const shortid = require('shortid');

/**
 * Get a random ID for a record
 */
const randid = _ => {
    return shortid.generate();
}

/**
 * Is the given ID a valid ID in our system?
 */
const validid = id => {
    return (
        typeof id === 'string'
        && id !== ''
        && !id.includes('.')
    );
}

const DANGEROUS_HTML_TAGS = [
    'head',
    'body',
    'title',
    'link',
    'style',
    'script',
];

const sanitizeDangerousHtml = markdownString => {
    let result = '';
    let inOpeningTag = false;
    let lastTag = '';

    for (let i = 0; i < markdownString.length; i ++) {
        const char = markdownString[i];

        if (char === '<') {
            inOpeningTag = true;
        } else if ((char === '>' || char.trim() == '') && inOpeningTag) {
            inOpeningTag = false;
            if (DANGEROUS_HTML_TAGS.includes(lastTag.trim().toLowerCase())) {
                // read and ignore until the tag is closed
                const closingTag = `</${lastTag}>`;
                const indexOfClosingTag = i + markdownString.substr(i).toLowerCase().indexOf(closingTag);
                if (indexOfClosingTag === -1) {
                    // tag is never closed, so ignore the rest of the string
                    i = markdownString.length;
                } else {
                    i = indexOfClosingTag + closingTag.length - 1;
                }
            } else {
                result += '<' + lastTag + char;
            }
            lastTag = '';
        } else {
            if (inOpeningTag) {
                lastTag += char;
            } else {
                result += char;
            }
        }
    }

    return result;
}

module.exports = {
    randid,
    validid,
    sanitizeDangerousHtml,
}

