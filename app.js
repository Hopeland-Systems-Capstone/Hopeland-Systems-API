//Express
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.options("*", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Length, X-Requested-With');
    res.send(200);
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

//Routes
app.use("/data", require("./routes/data")); //GET request for sensor data
app.use("/alerts", require("./routes/alerts")); //GET request for alerts

//Setup MongoDB
const { Mongo } = require('./mongo.js')
Mongo.connect();

//Log startup
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));