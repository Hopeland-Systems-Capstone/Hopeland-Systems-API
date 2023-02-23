const { MongoClient } = require('mongodb')

class Mongo {

    static async connect() {
        const credentials = 'X509-cert-2957358956160653009.pem'
        const client = new MongoClient('mongodb+srv://hopelandsystems.dobnt5r.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority', {
            sslKey: credentials,
            sslCert: credentials,
        });
        
        this.client = await client.connect();
        this.db = this.client.db("hopelandsystems");
        this.alerts = this.db.collection("alerts");
        
        if (! await this.alerts.findOne({
            "_id":"alert_id"
        })) {
            this.alerts.insertOne({
                "_id":"alert_id",
                "sequencevalue":0
            });
        }

        this.sensors = this.db.collection("sensors");

        if (! await this.sensors.findOne({
            "_id":"sensor_id"
        })) {
            this.sensors.insertOne({
                "_id":"sensor_id",
                "sequencevalue":0
            });
        }

        this.initializeGeospacialIndex();

        this.users = this.db.collection("users");

        if (! await this.users.findOne({
            "_id":"user_id"
        })) {
            this.users.insertOne({
                "_id":"user_id",
                "sequencevalue":0
            });
        }

        this.apikeys = this.db.collection("apikeys");
        console.log("Connected to MongoDB successfully");
        

        this.initializeSimulation(); //TODO: Delete this
    }

    static async initializeGeospacialIndex() {
        await this.sensors.createIndex({
            "geolocation":'2dsphere'
        });
    }

    static async initializeSimulation() { //TODO: Delete this
        const sensor_api = require('./api/sensor_api');
        await sensor_api.createSensor("sensor1",0,0);
        await sensor_api.createSensor("sensor2",50,70);
        await sensor_api.createSensor("sensor3",5.5,1.1);

        const users_api = require('./api/users_api');
        await users_api.createUser("Jacob", "jdpark10@asu.edu", "aaa");
        await users_api.createUser("Sunil", "sbinstoc@asu.edu", "aaa");

        await users_api.addSensorToUserWithUsername("Jacob",1);
        await users_api.addSensorToUserWithUsername("Jacob",2);
        await users_api.addSensorToUserWithUsername("Jacob",3);
        await users_api.removeSensorFromUserWithUsername("Jacob",3);
        await users_api.removeSensorFromUserWithUsername("Jacob",3);

        //const sensors = await sensor_api.getSensorsByGeolocation(0,0,1000000);
        //console.log(sensors);

        //await sensor_api.addSensorData("sensor3", "battery", 100)
        
        //const alerts_api = require("./api/alerts_api");
        //alerts_api.createAlert("New Alert", "This is a test alert");

        //const apikeys_api = require('./api/apikeys_api')
        //const level = await apikeys_api.getKeyLevel("aaa");
        //console.log(level);

    }

}

Mongo.client = null
Mongo.db = null
Mongo.alerts = null
Mongo.sensors = null
Mongo.users = null
Mongo.apikeys = null

module.exports = { Mongo }