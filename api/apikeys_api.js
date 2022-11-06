const { Mongo } = require('../mongo.js');

/**
 * Add an API key to the database
 * @param {String} key
 */
async function addKey(key) {

    const exists = await Mongo.apikeys.findOne({
        "key":`${key}`
    });
    if (exists) {
        console.log(`Key ${key} already exists.`);
        return;
    }

    Mongo.apikeys.insertOne({
        "key":`${key}`
    });
    console.log(`Added API key ${key}.`);
}

/**
 * Check if API key exists in database
 * @param {String} key
 * @returns {Boolean}
 */
 async function keyExists(key) {
    const exists = await Mongo.apikeys.findOne({
        "key":`${key}`
    });
    return exists;
}

/**
 * Remove an API key from the database
 * @param {String} key
 */
 async function deleteKey(key) {
    const result = Mongo.apikeys.deleteOne({
        "key":`${key}`,
    });
    if (result.deletedCount === 1) {
        console.log(`Deleted API key ${key}.`);
    } else {
        console.log(`API key ${key} does not exist.`);
    }
}

exports.addKey = addKey;
exports.keyExists = keyExists;
exports.deleteKey = deleteKey;