const express = require("express");
const router = express.Router();

//GET | /data?sensor=name | Returns all sensor data in json format

router.get("/", async (req, res, next) => {

    const key = req.query.key;
    if (key == null) {
        res.send("Request an API key")
        return;
    }

    const apikeys_api = require('../api/apikeys_api');
    const valid = await apikeys_api.keyExists(`${key}`);

    if (valid) {

        const sensor = req.query.sensor;
        const sensor_api = require('../api/sensor_api');
        const data = await sensor_api.getSensorData(sensor);
        res.json(data);
        
    } else {
        res.send("Invalid API key")
    }
});

module.exports = router;