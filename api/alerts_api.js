const { Mongo } = require("../mongo.js");

/**
 * Create a new alert given a title and alert
 * @param {String} title
 * @param {String} alert
 */
async function createAlert(title,alert) {
    Mongo.alerts.insertOne({
        "id" : getNextSequence('alert_id'),
        "title":`${title}`,
        "alert":`${alert}`
    });
    console.log(`Created new alert with title: ${title}, and alert of: ${alert}.`);
}

/**
 * Delete an alert given an id
 * @param {Number} id
 */
 async function deleteAlert(id) {
    const result = Mongo.alerts.deleteOne({
        "id":`${id}`,
    });
    if (result.deletedCount === 1) {
        console.log(`Deleted alert with id: ${id}.`);
    }
}

exports.createAlert = createAlert;
exports.deleteAlert = deleteAlert;