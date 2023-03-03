const { Mongo } = require('../mongo.js');

/**
 * Add an API key to the database
 * @param {String} key
 * @param {Number} level
 */
async function addKey(key, level = 1) {

    const exists = await Mongo.apikeys.findOne({
        "key":`${key}`
    });
    if (exists) {
        console.log(`Key ${key} already exists.`);
        return;
    }

    Mongo.apikeys.insertOne({
        "key":`${key}`,
        "level":`${level}`
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
 * Get level for API key
 * @param {String} key
 * @returns {Number}
 */
async function getKeyLevel(key) {
    const exists = await Mongo.apikeys.findOne({
        "key":`${key}`
    });
    if (!exists) {
        return -1;
    }
    return exists.level;
}

/**
 * Update level for API key
 * @param {String} key
 * @param {Number} level
 */
 async function updateKeyLevel(key, level) {
    await Mongo.apikeys.updateOne({
        "key":`${key}`
    }, {
        $set: {
            "level":`${level}`
        }
    }).then((res) => {
        if (res.matchedCount > 0) {
            console.log(`Changed level for API key ${key} to ${level}.`);
        } else {
            console.log(`Key ${key} does not exist.`);
        } 
    });
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

module.exports = {
    addKey,
    keyExists,
    getKeyLevel,
    updateKeyLevel,
    deleteKey,
};
  