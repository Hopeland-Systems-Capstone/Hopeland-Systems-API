const express = require("express");
const router = express.Router();
const limiter = require('./rate_limit/rate_limiting').limiter
const sensor_api = require('../api/sensor_api');
const api_key_util = require('./util/api_key_util');

//GET | /sensors?key=apikey&sensor=name | Returns all sensor data in json format
//GET | /sensors?key=apikey&longitude=0&latitude=0&distance=1000 | Returns all sensors within 1000 meters of longitude=0,latitude=0
//POST | /sensors?key=apikey&sensor=name&longitude=0&latitude=0 | Create a sensor with a name, longitude, and latitude
//DELETE | /sensors?key=apikey&sensor=name | Delete a sensor with a name
//PUT | /sensors?key=apikey&sensor=name&datatype=battery&value=100 | Add new data to a sensor

router.get("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

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
    const value = parseInt(req.query.value);

    if (!name || !datatype || isNaN(value)) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    if (await sensor_api.addSensorData(name, datatype, value)) {
        return res.status(200).json({ message: `Added ${value} to ${datatype} for sensor ${name}.` });
    } else {
        return res.status(500).json({ message: 'Error adding data to sensor.' });
    }
});

module.exports = router;