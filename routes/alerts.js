const express = require("express");
const router = express.Router();
const limiter = require('./rate_limit/rate_limiting').limiter

//GET | /alerts?key=apikey&from=epochstart | Returns all alerts from "from date" to "now date" (epoch times)
//GET | /alerts?key=apikey&to=epochend | Returns all alerts from "beginning of time date" to "to date" (epoch times)
//GET | /alerts?key=apikey&from=epochstart&to=epochend | Returns all alerts from "from date" to "to date" (epoch times)
//GET | /alerts?key=apikey&from=epochstart&to=epochend&amount=100 | Returns all alerts from "from date" to "to date" (epoch times), but caps at 100 alerts
//GET | /alerts?key=apikey&days=10 | Returns all alerts from the past 10 days
//GET | /alerts?key=apikey&days=10&amount=100 | Returns all alerts from the past 10 days, but caps at 100 alerts
//GET | /alerts?key=apikey&amount=10 | Returns the last 10 alerts
//POST | /alerts?key=apikey&title=New%20Alert&alert=This%20is%20a%20new%20alert | Create a new alert with a title and alert
//DELETE | /alerts?key=apikey&alert_id=0 | Delete alert with alert_id


router.get("/", limiter, async (req, res, next) => {

    const key = req.query.key;
    if (key == null) {
        res.send("Request an API key")
        return;
    }

    const apikeys_api = require('../api/apikeys_api');
    const valid = await apikeys_api.keyExists(`${key}`);

    if (valid) {
        const from = parseInt(req.query.from);
        const to = parseInt(req.query.to);
        const days = parseInt(req.query.days);
        const amount = parseInt(req.query.amount);

        const alerts_api = require('../api/alerts_api');
        const data = await alerts_api.getAlerts(from, to, days, amount);

        res.json(data);
    } else {
        res.send("Invalid API key")
    }
});

module.exports = router;