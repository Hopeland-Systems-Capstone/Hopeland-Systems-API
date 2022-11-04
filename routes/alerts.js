const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
    
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