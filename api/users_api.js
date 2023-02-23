const { Mongo } = require('../mongo.js');

/**
 * Returns next user id
 * @returns {Number}
 */
async function getNextUserID() {
    const sequence = await Mongo.users.findOneAndUpdate({
       "_id":`user_id`
    },{ $inc: { "sequencevalue":1 },},{ new:true }
    );
    return sequence.value.sequencevalue;
 }

/**
 * Create a new user with a name, email, and hashed_password
 * @param {String} name
 * @param {String} email
 * @param {String} hashed_password
 */
async function createUser(name, email, hashed_password) {

    const nameExists = await Mongo.users.findOne({
        "name":`${name}`
    });
    if (nameExists) {
        console.log(`User with name: ${name} already exists.`);
        return;
    }

    const emailExists = await Mongo.users.findOne({
        "email":`${email}`
    });
    if (emailExists) {
        console.log(`User with email: ${email} already exists.`);
        return;
    }

    const user_id = await getNextUserID();
    Mongo.users.insertOne({
        "user_id":user_id,
        "name":`${name}`,
        "email":`${email}`,
        "password":`${hashed_password}`,
        "sensors":[]
    });
    console.log(`Created new user with name: ${name} and email ${email}.`);
}

/**
 * Delete a user given a user_id
 * @param {Number} user_id
 */
 async function deleteUser(user_id) {
    const result = Mongo.users.deleteOne({
        "user_id":`${user_id}`,
    });
    if (result.deletedCount === 1) {
        console.log(`Deleted user with user_id: ${user_id}.`);
    }
}

/**
 * Get user given a username
 * @param {String} name
 */
async function getUserByUsername(name) {

    const result = await Mongo.users.find({
        "name":`${name}`
    });

    if (result) {
        console.log(`Found user with username ${name}.`);
    } else {
        console.log(`Did not find any user with this username.`);
        return null;
    }
    return result;
}

/**
 * Get user given an email
 * @param {String} email
 */
async function getUserByEmail(email) {

    const result = await Mongo.users.find({
        "email":`${email}`
    });

    if (result) {
        console.log(`Found user with email ${email}.`);
    } else {
        console.log(`Did not find any user with this email.`);
        return null;
    }
    return result;
}

/**
 * Get all the sensors a user has access to given username
 * @param {String} name
 */
async function getUserSensorsByUsername(name) {

    const projection = { sensors: 1, _id: 0 };

    const exists = await Mongo.users.findOne({
        "name":`${name}`
    }, projection);
    if (!exists) {
        console.log(`User with username: ${name} does not exist.`);
        return;
    }

    return JSON.parse(JSON.stringify(exists));
}

/**
 * Get all the sensors a user has access to given email
 * @param {String} email
 */
async function getUserSensorsByEmail(email) {

    const projection = { sensors: 1, _id: 0 };

    const exists = await Mongo.users.findOne({
        "email":`${email}`
    }, projection);
    if (!exists) {
        console.log(`User with email: ${email} does not exist.`);
        return;
    }

    return JSON.parse(JSON.stringify(exists));
}

exports.createUser = createUser;
exports.deleteUser = deleteUser;
exports.getUserByUsername = getUserByUsername;
exports.getUserByEmail = getUserByEmail;
exports.getUserSensorsByUsername = getUserSensorsByUsername;
exports.getUserSensorsByEmail = getUserSensorsByEmail;