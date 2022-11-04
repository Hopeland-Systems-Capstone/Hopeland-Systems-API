const { Mongo } = require('../mongo.js');

/**
 * Create a new sensor given a name, latitude, and longitude
 * @param {String} name
 * @param {Number} latitude
 * @param {Number} longitude
 */
async function createSensor(name, latitude, longitude) {

    const exists = await Mongo.sensors.findOne({
        "name":`${name}`
    });
    if (exists) {
        console.log(`Sensor with name: ${name} already exists.`);
        return;
    }

    Mongo.sensors.insertOne({
        "name":`${name}`,
        "geolocation":{
            "latitude":`${latitude}`,
            "longitude":`${longitude}`
        },
        "battery":[
            //{
            //    "time":"",
            //    "value":100
            //}
        ],
        "temperature":[
        ],
        "humidity":[
        ],
        "co2":[
        ],
        "pressure":[
        ]
    });
    console.log(`Created new sensor with name: ${name}, at ${latitude},${longitude}.`);
}

/**
 * Get sensor data given sensor name
 * @param {String} name
 */
async function getSensorData(name) {

    const exists = await Mongo.sensors.findOne({
        "name":`${name}`
    });
    if (!exists) {
        console.log(`Sensor with name: ${name} does not exist.`);
        return;
    }

    return JSON.parse(JSON.stringify(exists));
}

exports.createSensor = createSensor;
exports.getSensorData = getSensorData;