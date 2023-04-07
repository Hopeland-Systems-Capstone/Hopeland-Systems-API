const express = require("express");
const router = express.Router();
const limiter = require('./rate_limit/rate_limiting').limiter
const sensor_api = require('../api/sensor_api');
const users_api = require('../api/users_api');
const api_key_util = require('./util/api_key_util');

//GET | /sensors?key=apikey&sensor=name | Returns all sensor data in json format
//GET | /sensors?key=apikey&longitude=0&latitude=0&distance=1000 | Returns all sensors within 1000 meters of longitude=0,latitude=0
//GET | /sensors?key=apikey&username=name | Return all sensors a user has access to given only username
//GET | /sensors?key=apikey&email=email | Return all sensors a user has access to given only email
//POST | /sensors?key=apikey&sensor=name&longitude=0&latitude=0 | Create a sensor with a name, longitude, and latitude
//DELETE | /sensors?key=apikey&sensor=name | Delete a sensor with a name
//PUT | /sensors?key=apikey&sensor=name&datatype=battery&value=100 | Add new data to a sensor

router.get('/:user_id/countOffline', async (req, res) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);
    
    if (user_Id === NaN) {
        res.status(400).send('Invalid arguments');
    } else {
        const data = await sensor_api.countOffline(user_Id);
        res.status(200).json(data);
    }
});

router.get('/:user_id/countOnline', async (req, res) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);
    
    if (user_Id === NaN) {
        res.status(400).send('Invalid arguments');
    } else {
        const data = await sensor_api.countOnline(user_Id);
        res.status(200).json(data);
    }
});

router.get('/:sensor_id/getLastUpdated', async (req, res) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const sensor_Id = parseInt(req.params.sensor_id);
    
    if (sensor_Id === NaN) {
        res.status(400).send('Invalid arguments');
    } else {
        try {
            const reading = await sensor_api.getLastUpdated(sensor_Id);
            if (reading) {
                return res.status(200).json(reading);
            } else {
                return res.status(500).json({message: `Error getting last update`});
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: `Error getting last update`});  
        }
    }
});

router.get('/:sensor_id/:dataType/getLastReading', async (req, res) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const sensor_Id = parseInt(req.params.sensor_id);
    const dataType = String(req.params.dataType);
    
    if (sensor_Id === NaN || !dataType) {
        res.status(400).send('Invalid arguments')
    } else {
        const data = await sensor_api.getLastReading(sensor_Id, dataType);
        return res.status(200).json(data)
    }
});

router.get('/:sensor_id/:dataType/:timeStart/:timeEnd/getReadings', async (req, res) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const sensor_Id = parseInt(req.params.sensor_id);
    const dataType = String(req.params.dataType);
    const timeStart = parseInt(req.params.timeStart);
    const timeEnd = parseInt(req.params.timeEnd);

    if (sensor_Id === NaN || !dataType || timeStart === NaN || timeEnd === NaN) {
        res.status(400).send('Invalid arguments')
    } else {
        const data = await sensor_api.getReadings(sensor_Id, dataType, timeStart, timeEnd)
        return res.status(200).json(data);
    }    
});


router.get('/:sensor_id/getStatus', async (req, res) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const sensorId = parseInt(req.params.sensor_id);

    const status = await sensor_api.getStatus(sensorId);

    if (!status) {
      res.status(404).send('Sensor not found');
    } else {
      res.send(status);
    }
});

router.get('/:sensor_id/getName', async (req, res) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const sensorId = parseInt(req.params.sensor_id);

    const name = await sensor_api.getName(sensorId);

    if (!name) {
      res.status(404).send('Sensor not found');
    } else {
      res.send(name);
    }
});

router.get("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const username = req.query.username;
    const email = req.query.email;

    if (username || email) {
        if (username) {
            const sensors = await users_api.getUserSensorsByUsername(username);
            return res.status(200).json(sensors);
        } else if (email) {
            const sensors = await users_api.getUserSensorsByEmail(email);
            return res.status(200).json(sensors);
        }
    }

    const sensor = req.query.sensor;
    if (sensor) {
        const data = await sensor_api.getSensorData(sensor);
        return res.status(200).json(data);
    }

    const longitude = parseInt(req.query.longitude);
    const latitude = parseInt(req.query.latitude);
    const distance = parseInt(req.query.distance);

    if (isNaN(longitude) || isNaN(latitude) || isNaN(distance)) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    const data = await sensor_api.getSensorsByGeolocation(longitude,latitude,distance);
    return res.status(200).json(data);
    

});

router.post("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const name = req.query.sensor;
    const longitude = parseInt(req.query.longitude);
    const latitude = parseInt(req.query.latitude);

    if (!name || isNaN(longitude) || isNaN(latitude)) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    try {
        if (await sensor_api.createSensor(name, longitude, latitude)) {
            return res.status(201).json({ message: 'Sensor created successfully.' });
        } else {
            return res.status(500).json({ message: 'Error creating sensor.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating sensor.' });
    }
});

router.delete("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const name = req.query.sensor;

    if (!name) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    if (await sensor_api.deleteSensor(name)) {
        return res.status(200).json({ message: 'Sensor deleted successfully.' });
    } else {
        return res.status(500).json({ message: 'Error deleting sensor.' });
    }
});

router.put("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const name = req.query.sensor;
    const datatype = req.query.datatype;
    const value = Number(req.query.value);

    if (!name || !datatype || isNaN(value)) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    if (await sensor_api.addSensorData(name, datatype, value)) {
        return res.status(200).json({ message: `Added ${value} to ${datatype} for sensor ${name}.` });
    } else {
        return res.status(500).json({ message: 'Error adding data to sensor.' });
    }
});

router.put('/:sensor_id/:status/setStatus', async (req, res) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const sensor_Id = parseInt(req.params.sensor_id);
    const status = String(req.params.status);

    console.log(sensor_Id, status);
    
    if (sensor_Id === NaN || !status ) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await sensor_api.setStatus(sensor_Id, status);
        return res.status(200).json({ message: `Changed sensor ${sensor_Id} to status ${status}.` });
    }
});

module.exports = router;