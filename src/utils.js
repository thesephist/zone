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
    return id && shortid.isValid(id);
}

module.exports = {
    randid,
    validid,
}

