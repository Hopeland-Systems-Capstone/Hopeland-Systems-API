const { Mongo } = require('../mongo.js');
const { Long } = require('mongodb');

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

    const time = Long.fromString(Date.now().toString());

    const sensor_id = await getNextSensorID();
    Mongo.sensors.insertOne({
        "sensor_id":sensor_id,
        "name":`${name}`,
        "status":"Online",
        "last_update":time,
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

    time = Long.fromString(Date.now().toString());

    var key = data_type.toLowerCase(),
    new_data = {
        "last_update":time,
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

/**
 * Get sensor status
 * @param {Number} sensor_id
 */
async function getStatus(sensor_id) {
    const exists = await Mongo.sensors.findOne({
        "sensor_id":sensor_id
    });
    if (!exists) {
        console.log(`Sensor ${sensor_id} does not exist.`);
        return;
    }
    return exists.status;
}

/**
 * Set sensor status
 * @param {Number} sensor_id
 * @param {String} status
 */
async function setStatus(sensor_id, status) {
    const exists = await Mongo.sensors.findOne({ "sensor_id": sensor_id });
    if (!exists) {
        console.log(`Sensor ${sensor_id} does not exist.`);
        return null;
    }
    await Mongo.sensors.updateOne({ "sensor_id": sensor_id }, { $set: { "status":`${status}` } });
}

/**
 * Get sensor name
 * @param {Number} sensor_id
 */
async function getName(sensor_id) {
    const exists = await Mongo.sensors.findOne({
        "sensor_id":sensor_id
    });
    if (!exists) {
        console.log(`Sensor ${sensor_id} does not exist.`);
        return;
    }
    return exists.name;
}

/**
 * Get sensor readings for a specified time range and data type
 * @param {Number} sensor_id - sensor ID
 * @param {String} dataType - data type (temperature, pressure, humidity, co2, or battery)
 * @param {Number} timeStart - start time (epoch)
 * @param {Number} timeEnd - end time (epoch)
 */
async function getReadings(sensor_id, dataType, timeStart, timeEnd) {

    const sensor = await Mongo.sensors.findOne({
        "sensor_id":sensor_id
    });

    if (!sensor) {
        console.log(`Sensor ${sensor_id} does not exist.`);
        return null;
    }
    
    const readingsArray = sensor[dataType];
    if (!readingsArray) {
        console.log(`Sensor ${sensor_id} does not have any ${dataType} readings.`);
        return null;
    }

    const results = [];
    readingsArray.forEach((reading) => {
        if (reading.time >= timeStart && reading.time <= timeEnd) {
            results.push(reading.value);
        }
    });

    return results;
}

/**
 * Get last sensor reading for a specified sensor ID and data type
 * @param {Number} sensor_id - sensor ID
 * @param {String} dataType - data type (temperature, pressure, humidity, co2, or battery)
 */
async function getLastReading(sensor_id, dataType) {

    const sensor = await Mongo.sensors.findOne({
        "sensor_id":sensor_id
    });

    if (!sensor) {
        console.log(`Sensor ${sensor_id} does not exist.`);
        return null;
    }

    const readingsArray = sensor[dataType];
    if (!readingsArray || readingsArray.length === 0) {
        console.log(`Sensor ${sensor_id} does not have any ${dataType} readings.`);
        return null;
    }

    const lastReading = readingsArray[readingsArray.length - 1];

    return lastReading.value;
}

/**
 * Get sensor last updated time
 * @param {Number} sensor_id
 */
async function getLastUpdated(sensor_id) {
    const exists = await Mongo.sensors.findOne({
        "sensor_id":sensor_id
    });
    if (!exists) {
        console.log(`Sensor ${sensor_id} does not exist.`);
        return;
    }
    return exists.last_update;
}

/**
 * Count the number of online sensors associated with a user_id
 * @param {Number} user_id - user id
 */
async function countOnline(user_id) {
    const projection = { sensors: 1, _id: 0 };

    const user = await Mongo.users.findOne({
        "user_id":user_id
    }, projection);

    if (!user) {
        console.log(`User ${user_id} does not exist.`);
        return null;
    }

    const sensorIds = user.sensors.map(sensor => sensor.sensor_id);

    const onlineSensors = await Mongo.sensors.countDocuments({
        sensor_id: { $in: sensorIds },
        status: "Online"
    });

    return onlineSensors;
}

/**
 * Count the number of offline sensors associated with a user_id
 * @param {Number} user_id - user id
 */
async function countOffline(user_id) {
    const projection = { sensors: 1, _id: 0 };

    const user = await Mongo.users.findOne({
        "user_id":user_id
    }, projection);

    if (!user) {
        console.log(`User ${user_id} does not exist.`);
        return null;
    }

    const sensorIds = user.sensors.map(sensor => sensor.sensor_id);

    const offlineSensors = await Mongo.sensors.countDocuments({
        sensor_id: { $in: sensorIds },
        status: "Offline"
    });

    return offlineSensors;
}



module.exports = {
    createSensor,
    deleteSensor,
    getSensorsByGeolocation,
    getSensorData,
    addSensorData,
    getStatus,
    setStatus,
    getName,
    getReadings,
    getLastReading,
    getLastUpdated,
    countOnline,
    countOffline,
};
  