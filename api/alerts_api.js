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
 */
async function createAlert(title,alert) {
    const alert_id = await getNextAlertID();
    Mongo.alerts.insertOne({
        "alert_id":alert_id,
        "title":`${title}`,
        "alert":`${alert}`,
        "time":Date.now()
    });
    console.log(`Created new alert with title: ${title}, alert of: ${alert}, and alert_id of ${alert_id}.`);
}

/**
 * Delete an alert given an alert_id
 * @param {Number} alert_id
 */
 async function deleteAlert(alert_id) {
    const result = Mongo.alerts.deleteOne({
        "alert_id":`${id}`,
    });
    if (result.deletedCount === 1) {
        console.log(`Deleted alert with alert_id: ${id}.`);
    }
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

module.exports = {
    createAlert,
    deleteAlert,
    getAlerts,
};