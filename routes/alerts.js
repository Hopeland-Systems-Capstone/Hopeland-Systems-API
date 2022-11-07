const express = require("express");
const router = express.Router();
const limiter = require('./rate_limit/rate_limiting').limiter

//GET | /alerts?key=apikey&from=epochstart&to=epochend | Returns all alerts from "from date" to "to date" (epoch times)
//GET | /alerts?key=apikey&from=epochstart&to=epochend&amount=100 | Returns all alerts from "from date" to "to date" (epoch times), but caps at 100 alerts
//GET | /alerts?key=apikey&days=10 | Returns all alerts from the past 10 days
//GET | /alerts?key=apikey&days=10&amount=100 | Returns all alerts from the past 10 days, but caps at 100 alerts
//GET | /alerts?key=apikey&amount=10 | Returns the last 10 alerts

router.get("/", limiter, (req, res, next) => {
    
    //Check either from-to, days (as in days back), or amount (as in the last n alerts)
    const from = req.query.from;
    const to = req.query.to;

    const days = req.query.days;

    const amount = req.query.amount;

    //TODO: Get alert data based on parameters
    //const sensor_api = require('../api/alerts_api');
    //const data = await alerts_api.getAlerts(sensor);

    res.json(data);
});

module.exports = router;