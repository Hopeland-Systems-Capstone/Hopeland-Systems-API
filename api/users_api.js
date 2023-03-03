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
        "sensors":[],
        "alerts":[]
    });
    console.log(`Created new user with name: ${name} and email ${email}.`);
}

/**
 * Delete a user given a user_id
 * @param {Number} user_id
 */
 async function deleteUser(user_id) {
    const result = Mongo.users.deleteOne({
        "user_id":parseInt(user_id),
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

/**
 * Check if a username/password combo is correct
 * @param {String} name
 * @param {String} hashed_password
 */
async function verifyUsernamePasswordCombo(name, hashed_password) {

    const exists = await Mongo.users.findOne({
        "name":`${name}`,
        "password":`${hashed_password}`
    });
    if (!exists) {
        console.log(`Username ${name} with hashed password ${hashed_password} is invalid.`);
        return false;
    }

    return true;
}

/**
 * Check if a email/password combo is correct
 * @param {String} email
 * @param {String} hashed_password
 */
async function verifyEmailPasswordCombo(email, hashed_password) {

    const exists = await Mongo.users.findOne({
        "email":`${email}`,
        "password":`${hashed_password}`
    });
    if (!exists) {
        console.log(`Email ${email} with hashed password ${hashed_password} is invalid.`);
        return false;
    }

    return true;
}

/**
 * Add a sensor to a user's list of sensors
 * @param {String} username
 * @param {Number} sensor_id
 */
async function addSensorToUserWithUsername(name, sensor_id) {
    await Mongo.users.updateOne({
        "name":`${name}`
    }, {
        $addToSet: {
            "sensors": sensor_id
        }
    }).then((res) => {
        if (res.matchedCount > 0) {
            if (res.modifiedCount > 0) {
                console.log(`Added sensor with sensor_id ${sensor_id} to ${name}'s sensors.`);
            } else {
                console.log(`Sensor with sensor_id ${sensor_id} already exists in ${name}'s sensors.`);
            }
        } else {
            console.log(`User with username ${name} does not exist.`);
        } 
    });
}

/**
 * Add a sensor to a user's list of sensors
 * @param {String} email
 * @param {Number} sensor_id
 */
async function addSensorToUserWithEmail(email, sensor_id) {
    await Mongo.users.updateOne({
        "email":`${email}`
    }, {
        $addToSet: {
            "sensors": sensor_id
        }
    }).then((res) => {
        if (res.matchedCount > 0) {
            if (res.modifiedCount > 0) {
                console.log(`Added sensor with sensor_id ${sensor_id} to ${email}'s sensors.`);
            } else {
                console.log(`Sensor with sensor_id ${sensor_id} already exists in ${email}'s sensors.`);
            }
        } else {
            console.log(`User with email ${email} does not exist.`);
        } 
    });
}

/**
 * Remove a sensor from a user's list of sensors
 * @param {String} username
 * @param {Number} sensor_id
 */
async function removeSensorFromUserWithUsername(name, sensor_id) {
    await Mongo.users.updateOne({
        "name":`${name}`
    }, {
        $pull: {
            "sensors": sensor_id
        }
    }).then((res) => {
        if (res.matchedCount > 0) {
            if (res.modifiedCount > 0) {
                console.log(`Removed sensor with sensor_id ${sensor_id} from ${name}'s sensors.`);
            } else {
                console.log(`Sensor with sensor_id ${sensor_id} does not exist in ${name}'s sensors.`);
            }
        } else {
            console.log(`User with username ${name} does not exist.`);
        } 
    });
}

/**
 * Remove a sensor from a user's list of sensors
 * @param {String} email
 * @param {Number} sensor_id
 */
async function removeSensorFromUserWithEmail(email, sensor_id) {
    await Mongo.users.updateOne({
        "email":`${email}`
    }, {
        $pull: {
            "sensors": sensor_id
        }
    }).then((res) => {
        if (res.matchedCount > 0) {
            if (res.modifiedCount > 0) {
                console.log(`Removed sensor with sensor_id ${sensor_id} from ${email}'s sensors.`);
            } else {
                console.log(`Sensor with sensor_id ${sensor_id} does not exist in ${email}'s sensors.`);
            }
        } else {
            console.log(`User with email ${email} does not exist.`);
        } 
    });
}

/**
 * Add an alert to a user's list of alerts
 * @param {String} username
 * @param {Number} alert_id
 */
async function addAlertToUserWithUsername(name, alert_id) {
    await Mongo.alerts.updateOne({
        "name":`${name}`
    }, {
        $addToSet: {
            "alerts": alert_id
        }
    }).then((res) => {
        if (res.matchedCount > 0) {
            if (res.modifiedCount > 0) {
                console.log(`Added alert with alert_id ${alert_id} to ${name}'s alerts.`);
            } else {
                console.log(`Alert with alert_id ${alert_id} already exists in ${name}'s alerts.`);
            }
        } else {
            console.log(`User with username ${name} does not exist.`);
        } 
    });
}

/**
 * Add an alert to a user's list of alerts
 * @param {String} email
 * @param {Number} alert_id
 */
async function addAlertToUserWithEmail(email, alert_id) {
    await Mongo.alerts.updateOne({
        "email":`${email}`
    }, {
        $addToSet: {
            "alerts": alert_id
        }
    }).then((res) => {
        if (res.matchedCount > 0) {
            if (res.modifiedCount > 0) {
                console.log(`Added alert with alert_id ${alert_id} to ${email}'s alerts.`);
            } else {
                console.log(`Alert with alert_id ${alert_id} already exists in ${email}'s alerts.`);
            }
        } else {
            console.log(`User with email ${email} does not exist.`);
        } 
    });
}

/**
 * Remove an alert from a user's list of alert
 * @param {String} username
 * @param {Number} alert_id
 */
async function removeAlertFromUserWithUsername(name, alert_id) {
    await Mongo.users.updateOne({
        "name":`${name}`
    }, {
        $pull: {
            "alerts": alert_id
        }
    }).then((res) => {
        if (res.matchedCount > 0) {
            if (res.modifiedCount > 0) {
                console.log(`Removed alert with alert_id ${alert_id} from ${name}'s alerts.`);
            } else {
                console.log(`Alert with alert_id ${alert_id} does not exist in ${name}'s alerts.`);
            }
        } else {
            console.log(`User with name ${name} does not exist.`);
        } 
    });
}

/**
 * Remove an alert from a user's list of alert
 * @param {String} email
 * @param {Number} alert_id
 */
async function removeAlertFromUserWithEmail(email, alert_id) {
    await Mongo.users.updateOne({
        "email":`${email}`
    }, {
        $pull: {
            "alerts": alert_id
        }
    }).then((res) => {
        if (res.matchedCount > 0) {
            if (res.modifiedCount > 0) {
                console.log(`Removed alert with alert_id ${alert_id} from ${email}'s alerts.`);
            } else {
                console.log(`Alert with alert_id ${alert_id} does not exist in ${email}'s alerts.`);
            }
        } else {
            console.log(`User with email ${email} does not exist.`);
        } 
    });
}

module.exports = {
    createUser,
    deleteUser,
    getUserByUsername,
    getUserByEmail,
    getUserSensorsByUsername,
    getUserSensorsByEmail,
    verifyUsernamePasswordCombo,
    verifyEmailPasswordCombo,
    addSensorToUserWithUsername,
    addSensorToUserWithEmail,
    removeSensorFromUserWithUsername,
    removeSensorFromUserWithEmail,
    addAlertToUserWithUsername,
    addAlertToUserWithEmail,
    removeAlertFromUserWithUsername,
    removeAlertFromUserWithEmail,
};