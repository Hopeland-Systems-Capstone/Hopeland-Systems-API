const { Mongo } = require('../mongo.js');

/**
 * Returns next sensor id
 * @returns {Number}
 */
async function getNextSensorID() {
    const sequence = await Mongo.sensors.findOneAndUpdate({
       "_id":`sensor_id`
    },{ $inc: { "sequencevalue":1 },},{ new:true }
    );
    return sequence.value.sequencevalue;
 }

/**
 * Create a new sensor given a name, longitude, and latitude
 * @param {String} name
 * @param {Number} longitude
 * @param {Number} latitude
 */
async function createSensor(name, longitude, latitude) {

    if (longitude > 180 || longitude < -180 || latitude > 90 || latitude < -90) {
        console.log(`Invalid longitude/longitude`);
        return false;
    }

    const exists = await Mongo.sensors.findOne({
        "name":`${name}`
    });
    if (exists) {
        console.log(`Sensor with name: ${name} already exists.`);
        return false;
    }

    const sensor_id = await getNextSensorID();
    Mongo.sensors.insertOne({
        "sensor_id":sensor_id,
        "name":`${name}`,
        "geolocation":{
            "type": "Point",
            "coordinates": [ longitude, latitude]
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
    console.log(`Created new sensor with name: ${name}, at ${longitude},${latitude}.`);
    return true;
}

/**
 * Delete a sensor given a name
 * @param {String} name
 */
 async function deleteSensor(name) {
    const result = await Mongo.sensors.deleteOne({
        "name":`${name}`,
    });
    if (result.deletedCount === 1) {
        console.log(`Deleted sensor with name: ${name}.`);
        return true;
    } else {
        console.log(`Sensor with name ${name} does not exist.`);
        return false;
    }
}

/**
 * Get sensors given geolocation
 * @param {Number} longitude
 * @param {Number} latitude
 * @param {Number} distance_kilometers Distance within geolocation in meters
 */
async function getSensorsByGeolocation(longitude, latitude, distance_meters) {

    if (longitude > 180 || longitude < -180 || latitude > 90 || latitude < -90) {
        console.log(`Invalid longitude/longitude`);
        return;
    }

    const result = await Mongo.sensors.find({
        "geolocation": {
            $nearSphere: {
                $geometry: {
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                },
                $maxDistance: distance_meters
            }
        }
    }).toArray();

    console.log(`Returning ${result.length} sensors within ${distance_meters} meters of longitude: ${longitude}, latitude: ${latitude}.`);

    return result;
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

/**
 * Add new battery, temperature, humidity, or pressure data to sensor
 * @param {String} sensor_name
 * @param {String} data_type
 * @param {Number} value
 */
 async function addSensorData(sensor_name, data_type, value) {

    if (data_type != "battery" && data_type != "temperature" && data_type != "humidity" && data_type != "pressure") {
        console.log(`Invalid data type ${data_type}.`);
        return false;
    }

    time = Date.now()

    var key = data_type.toLowerCase(),
    new_data = {
        [key]: {
            "time":time,
            "value":value
        }
    };

    passed = false;
    await Mongo.sensors.updateOne({
        "name":`${sensor_name}`
    }, {
        $push: new_data
    }).then((res) => {
        if (res.matchedCount > 0) {
            console.log(`Added ${data_type} of ${value} at ${time} to sensor ${sensor_name}.`);
            passed = true;
        } else {
            console.log(`Sensor with name ${sensor_name} does not exist.`);
            passed = false;
        } 
    });
    return passed;
}

module.exports = {
    createSensor,
    deleteSensor,
    getSensorsByGeolocation,
    getSensorData,
    addSensorData,
};
  