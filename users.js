const express = require("express");
const router = express.Router();
const limiter = require('./rate_limit/rate_limiting').limiter
const users_api = require('../api/users_api');
const api_key_util = require('./util/api_key_util');

//GET | /users?key=apikey&user=name | Return user information when only given name
//GET | /users?key=apikey&user=email | Return user information when only given email
//GET | /users?key=apikey&user=email&idtype=SesnorsByEmail | Return User sesnor information when given only email
//GET | /users?key=apikey&user=name&idtype=SesnorsByUsername | Return User sesnor information when given only name
//GET | /users?key=apikey&user=name&hashed_password=hashed_password | Verify User Password Combo when given name and password
//GET | /users?key=apikey&user=email&hashed_password=hashed_password | Verify User Password Combo when given email and password
//POST | /users?key=apikey&name=name&email=email&hashed_password=hashed_password | Create new user given name, email, hashed_password
//DELETE / /users?key=apikey&user=name | Delete user when only given name
//DELETE / /users?key=apikey&user=name&sensor_id=sensor_id | Delete sensor from user when given sensor_id and name
//DELETE / /users?key=apikey&user=email&sensor_id=sensor_id | Delete sensor from user when given sensor_id and email
//DELETE / /users?key=apikey&user=name&alert_id=alert_id | Delete sensor from user when given alert_id and name
//DELETE / /users?key=apikey&user=email&alert_id=alert_id | Delete sensor from user when given alert_id and email
//PUT / /users?key=apikey&user=name&sensor_id=sensor_id | Add sensor to user when given sensor_id and name 
//PUT / /users?key=apikey&user=email&sensor_id=sensor_id | Add sensor to user when given sensor_id and email 
//PUT / /users?key=apikey&user=name&alert_id=alert_id | Add salert to user when given alert_id and name 
//PUT / /users?key=apikey&user=email&salert_id=alert_id | Add alert to user when given alert_id and email 


//idtype = SensorsByUsername, catching call to getUserSensorsByUsername
//idtype = SensorsByEmail, catching call to getUserSensorsByEmail
router.get("/", limiter, async (req, res, next, idtype) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const name = req.query.name;
    const email = req.query.email;
    const hashed_password = req.query.hashed_password;
    
    if (idtype = "SensorsByUsername")
    {
        const data = await users_api.getUserSensorsByUsername(name);
        return res.status(200).json(data);
    }

    if (idtype = "SensorsByEmail")
    {
        const data = await users_api.getUserSensorsByEmail(email);
        return res.status(200).json(data);
    }

    if (hashed_password)
    {
        if (email)
        {
            const valid = await users_api.verifyEmailPasswordCombo(email, hashed_password);
            return res.status(200).json(valid);
        }
        else
        {
            const valid = await users_api.verifyUsernamePasswordCombo(name, hashed_password);
            return res.status(200).json(valid);
        }
    }
    
    if (name) {
        const user = await users_api.getUserByUsername(name);
        return res.status(200).json(user);
    }

    
    if (email) {
        const user = await users_api.getUserByEmail(email);
        return res.status(200).json(user);
    }

    
    if (!name && !email ) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    

});

router.post("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return; //Checks if key is valid, returns if not

    const name = req.query.name;
    const email = req.query.email;
    const hashed_password = req.query.hashed_password;

    if (!name || !email || !hashed_password) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    try {
        if (await users_api.createUser(name, email, hashed_password)) {
            return res.status(201).json({ message: 'User created successfully.' });
        } else {
            return res.status(500).json({ message: 'Error creating User.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating User.' });
    }
});

router.delete("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const name = req.query.name;
    const email = req.query.email;
    const sensor_id = req.query.sensor_id;
    const alert_id = req.query.alert_id;

    if (sensor_id)
    {
        if (name)
        {
            await users_api.removeSensorFromUserWithUsername(name, sensor_id);
            return res.status(200).json({ message: `Removed ${sensor_id} to ${name}.` });
        }
        else
        {
            await users_api.removeSensorFromUserWithEmail(email, sensor_id);
            return res.status(200).json({ message: `Removed ${sensor_id} to ${email}.` });
        }
    }
    
    if (alert_id)
    {
        if (name)
        {
            await users_api.removeAlertFromUserWithUsername(name, alert_id);
            return res.status(200).json({ message: `Removed ${alert_id} to ${name}.` });
        }
        else
        {
            await users_api.removeAlertFromUserWithEmail(email, alert_id);
            return res.status(200).json({ message: `Removed ${alert_id} to ${email}.` });
        }
    }


    if (!name) {
        return res.status(400).json({ error: 'Invalid argument, check name.' });
    }

    if (await users_api.deleteUser(name)) {
        return res.status(200).json({ message: 'User deleted successfully.' });
    } else {
        return res.status(500).json({ message: 'Error deleting User.' });
    }
});

router.put("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const name = req.query.name;
    const email = req.query.email;
    const sensor_id = req.query.sensor_id;
    const alert_id = req.query.alert_id;

    if (sensor_id)
    {
        if (name)
        {
            await users_api.addSensorToUserWithUsername(name, sensor_id);
            return res.status(200).json({ message: `Added ${sensor_id} to ${name}.` });
        }
        else
        {
            await users_api.addSensorToUserWithEmail(email, sensor_id);
            return res.status(200).json({ message: `Added ${sensor_id} to ${email}.` });
        }
    }
    
    if (alert_id)
    {
        if (name)
        {
            await users_api.addAlertToUserWithUsername(name, alert_id);
            return res.status(200).json({ message: `Added ${alert_id} to ${name}.` });
        }
        else
        {
            await users_api.addAlertToUserWithEmail(email, alert_id);
            return res.status(200).json({ message: `Added ${alert_id} to ${email}.` });
        }
    }    
});



