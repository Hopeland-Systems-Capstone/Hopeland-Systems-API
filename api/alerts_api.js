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

exports.createAlert = createAlert;
exports.deleteAlert = deleteAlert;