const express = require("express");
const router = express.Router();
const limiter = require('./rate_limit/rate_limiting').limiter

//GET | /data?key=apikey&sensor=name | Returns all sensor data in json format
//GET | /data?key=apikey&longitude=0&latitude=0&distance=1000 | Returns all sensors within 1000 meters of longitude=0,latitude=0

router.get("/", limiter, async (req, res, next) => {

    const key = req.query.key;
    if (key == null) {
        res.send("Request an API key")
        return;
    }

    const apikeys_api = require('../api/apikeys_api');
    const valid = await apikeys_api.keyExists(`${key}`);

    if (valid) {

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

    } else {
        res.send("Invalid API key")
    }
});

module.exports = router;