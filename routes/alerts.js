const express = require("express");
const router = express.Router();
const limiter = require('./rate_limit/rate_limiting').limiter
const alerts_api = require('../api/alerts_api');
const api_key_util = require('./util/api_key_util');

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

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const from = parseInt(req.query.from);
    const to = parseInt(req.query.to);
    const days = parseInt(req.query.days);
    const amount = parseInt(req.query.amount);

    const data = await alerts_api.getAlerts(from, to, days, amount);

    res.json(data);

});

router.post("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const title = req.query.title;
    const alert = req.query.alert;

    if (!title || !alert) {
        return res.status(400).json({ error: 'Missing required parameters.' });
    }

    try {
        if (await alerts_api.createAlert(title, alert)) {
            return res.status(201).json({ message: 'Alert created successfully.' });
        } else {
            return res.status(500).json({ message: 'Error creating alert.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating alert.' });
    }
});

router.delete("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const alert_id = parseInt(req.query.alert_id);

    if (!alert_id) {
        return res.status(400).json({ error: 'Missing required parameters.' });
    }

    if (await alerts_api.deleteAlert(alert_id)) {
        return res.status(200).json({ message: 'Alert deleted successfully.' });
    } else {
        return res.status(500).json({ message: 'Error deleting alert.' });
    }
});

module.exports = router;