const { Mongo } = require("../mongo.js");

/**
 * Returns next alert id
 * @returns {Number}
 */
async function getNextAlertID() {
    const sequence = await Mongo.alerts.findOneAndUpdate({
       "_id":`alert_id`
    },{ $inc: { "sequencevalue":1 },},{ new:true }
    );
    return sequence.value.sequencevalue;
 }

/**
 * Create a new alert given a title and alert
 * @param {String} title
 * @param {String} alert
 * @param {Number} associated_sensor
 */
async function createAlert(title,alert,associated_sensor) {
    const alert_id = await getNextAlertID();
    Mongo.alerts.insertOne({
        "alert_id":alert_id,
        "title":`${title}`,
        "alert":`${alert}`,
        "time":Date.now(),
        "associated_sensor":associated_sensor
    });
    console.log(`Created new alert with title: ${title}, alert of: ${alert}, and alert_id of ${alert_id}.`);
    return alert_id;
}

/**
 * Delete an alert given an alert_id
 * @param {Number} alert_id
 */
 async function deleteAlert(alert_id) {
    const result = await Mongo.alerts.deleteOne({
        "alert_id":parseInt(alert_id),
    });
    if (result.deletedCount === 1) {
        console.log(`Deleted alert with alert_id: ${alert_id}.`);
        return true;
    }
    console.log(`No alert with alert_id ${alert_id} found.`);
    return false;
}

/**
 * Get alerts given parameters. Returns alerts from newest to oldest.
 * @param {Number} from epoch start time
 * @param {Number} to epoch end time
 * @param {Number} days how many days back to go
 * @param {Number} amount max amount of alerts to return
 */
async function getAlerts(from, to, days, amount) {
    
    fromDefined = !isNaN(from)
    toDefined = !isNaN(to)
    daysDefined = !isNaN(days)

    const result = await Mongo.alerts.find({
        "time":
        (fromDefined && toDefined) ? {$gte: from, $lte: to} :
        fromDefined ? {$gte: from} :
        toDefined ? {$lte: to} :
        daysDefined ? {$gte: (Date.now()-(days*86400*1000))} :
        {$gte: 0}
    }
    ).sort({"_id":-1}).limit(amount).toArray();

    console.log(`Returning ${result.length} alerts given parameters from ${from}, to ${to}, days ${days}, and amount ${amount}.`);

    return result;

}

/**
 * Get sensor id associated with alert
 * @param {Number} alert_id Alert ID
 */
async function getSensor(alert_id) {
    const exists = await Mongo.alerts.findOne({
        "alert_id":alert_id
    });
    if (!exists) {
        console.log(`Alert with id ${alert_id} does not exist.`);
        return -1;
    }
    return exists.associated_sensor;
}

module.exports = {
    createAlert,
    deleteAlert,
    getAlerts,
    getSensor
};