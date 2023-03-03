const express = require("express");
const router = express.Router();
const limiter = require('./rate_limit/rate_limiting').limiter
const api_key_util = require('./util/api_key_util');

//GET | /sensors?key=apikey&sensor=name | Returns all sensor data in json format
//GET | /sensors?key=apikey&longitude=0&latitude=0&distance=1000 | Returns all sensors within 1000 meters of longitude=0,latitude=0
//POST | /sensors?key=apikey&sensor=name&longitude=0&latitude=0 | Create a sensor with a name, longitude, and latitude
//DELETE | /sensors?key=apikey&sensor=name | Delete a sensor with a name
//PUT | /sensors?key=apikey&sensor=name&datatype=battery&value=100 | Add new data to a sensor

router.get("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const sensor = req.query.sensor;

    if (sensor != undefined) {
        const sensor_api = require('../api/sensor_api');
        const data = await sensor_api.getSensorData(sensor);
        res.json(data);
        return;
    }

    const longitude = parseInt(req.query.longitude);
    const latitude = parseInt(req.query.latitude);
    const distance = parseInt(req.query.distance);

    if (!isNaN(longitude) && !isNaN(latitude) && !isNaN(distance)) {
        const sensor_api = require('../api/sensor_api');
        const data = await sensor_api.getSensorsByGeolocation(longitude,latitude,distance);
        res.json(data);
        return;
    }

    res.send("Invalid arguments")

});

module.exports = router;