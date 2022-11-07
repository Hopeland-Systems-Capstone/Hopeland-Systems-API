const { MongoClient } = require('mongodb')

class Mongo {

    static async connect() {
        const credentials = 'X509-cert-1301818279006279178.pem'
        const client = new MongoClient('mongodb+srv://hopelandsystems.dobnt5r.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority', {
            sslKey: credentials,
            sslCert: credentials,
        });
        
        this.client = await client.connect();
        this.db = this.client.db("hopelandsystems");
        this.alerts = this.db.collection("alerts");
        this.sensors = this.db.collection("sensors");
        this.users = this.db.collection("users");
        this.apikeys = this.db.collection("apikeys");
        console.log("Connected to MongoDB successfully");
        

        this.initializeSimulation(); //TODO: Delete this
    }

    static async initializeSimulation() { //TODO: Delete this
        const sensor_api = require('./api/sensor_api')
        await sensor_api.createSensor("sensor1",100,100);
        await sensor_api.createSensor("sensor2",200,200);
        await sensor_api.createSensor("sensor3",5.5,1.1);

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