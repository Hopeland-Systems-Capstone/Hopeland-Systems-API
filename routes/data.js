const express = require("express");
const router = express.Router();

//GET | /data?sensor=name | Returns all sensor data in json format

router.get("/", async (req, res, next) => {
    const sensor = req.query.sensor;

    const sensor_api = require('../api/sensor_api');
    const data = await sensor_api.getSensorData(sensor);

    res.json(data);
});

module.exports = router;