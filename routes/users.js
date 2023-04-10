const express = require("express");
const router = express.Router();
const limiter = require('./rate_limit/rate_limiting').limiter
const users_api = require('../api/users_api');
const api_key_util = require('./util/api_key_util');

//GET | /users?key=apikey&username=name | Return user information when only given username
//GET | /users?key=apikey&email=email | Return user information when only given email
//GET | /users?key=apikey&username=name&hashed_password=hashed_password | Verify user password combo when given username and password
//GET | /users?key=apikey&email=email&hashed_password=hashed_password | Verify user password combo when given email and password
//POST | /users?key=apikey&username=name&email=email&hashed_password=hashed_password&phone_number=0000000000&company_name=Hopeland&timezone=MST | Create new user given username, email, hashed_password (Optional phone_number, company_name, and timezone)
//DELETE | /users?key=apikey&user_id=user_id | Delete user give user_id
//DELETE | /users?key=apikey&username=name&sensor_id=sensor_id | Delete sensor from user when given sensor_id and username
//DELETE | /users?key=apikey&email=email&sensor_id=sensor_id | Delete sensor from user when given sensor_id and email
//DELETE | /users?key=apikey&username=name&alert_id=alert_id | Delete alert from user when given alert_id and username
//DELETE | /users?key=apikey&email=email&alert_id=alert_id | Delete alert from user when given alert_id and email
//PUT | /users?key=apikey&username=name&sensor_id=sensor_id | Add sensor to user when given sensor_id and name 
//PUT | /users?key=apikey&email=email&sensor_id=sensor_id | Add sensor to user when given sensor_id and email 
//PUT | /users?key=apikey&username=name&alert_id=alert_id | Add alert to user when given alert_id and username 
//PUT | /users?key=apikey&email=email&salert_id=alert_id | Add alert to user when given alert_id and email

router.get("/:user_id/PhoneNumber", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);

    if ( user_Id === NaN) {
        return res.status(400).json({error: `Invalid arguments`})
    } else {
        const data = await users_api.getPhoneNumber(user_Id);
        return res.status(200).json(data);
    }

});

router.get("/:user_id/CompanyName", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);

    if ( user_Id === NaN) {
        return res.status(400).json({error: `Invalid arguments`})
    } else {
        const data = await users_api.getCompanyName(user_Id);
        return res.status(200).json(data);
    }

});

router.get("/:user_id/Name", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);

    if ( user_Id === NaN) {
        return res.status(400).json({error: `Invalid arguments`})
    } else {
        const data = await users_api.getName(user_Id);
        return res.status(200).json(data);
    }

});

router.get("/:user_id/Email", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);

    if ( user_Id === NaN) {
        return res.status(400).json({error: `Invalid arguments`})
    } else {
        const data = await users_api.getEmail(user_Id);
        return res.status(200).json(data);
    }

});

router.get("/:user_id/Alerts", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);

    if ( user_Id === NaN) {
        return res.status(400).json({error: `Invalid arguments`})
    } else {
        const data = await users_api.getAlerts(user_Id);
        return res.status(200).json(data);
    }

});

router.get("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const username = req.query.username;
    const email = req.query.email;
    const hashed_password = req.query.hashed_password;
    
    if (hashed_password) {
        if (username) {
            const valid = await users_api.verifyUsernamePasswordCombo(username, hashed_password);
            return res.status(200).json(valid);
        } else if (email) {
            const valid = await users_api.verifyEmailPasswordCombo(email, hashed_password);
            return res.status(200).json(valid);
        } else {
            return res.status(400).json({ error: 'Invalid arguments.' });
        }
    }

    if (username && email) {
        return res.status(400).json({ error: 'Can only specify username or password.' });
    }

    if (username) {
        const user = await users_api.getUserByUsername(username);
        return res.status(200).json(user);
    }

    if (email) {
        const user = await users_api.getUserByEmail(email);
        return res.status(200).json(user);
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

router.post("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const username = req.query.username;
    const email = req.query.email;
    const hashed_password = req.query.hashed_password;
    const phone_number = req.query.phone_number;
    const company_name = req.query.company_name;
    const timezone = req.query.timezone;

    if (!username || !email || !hashed_password) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    try {
        if (await users_api.createUser(username, email, hashed_password, phone_number, company_name, timezone)) {
            return res.status(201).json({ message: 'User created successfully.' });
        } else {
            return res.status(500).json({ message: 'Error creating user.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating user.' });
    }
});

router.delete("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = req.query.user_id;
    const username = req.query.username;
    const email = req.query.email;
    const sensor_id = req.query.sensor_id;
    const alert_id = req.query.alert_id;

    if (sensor_id) {
        if (username) {
            await users_api.removeSensorFromUserWithUsername(username, sensor_id);
            return res.status(200).json({ message: `Removed ${sensor_id} from user with name ${username}.` });
        } else if (email) {
            await users_api.removeSensorFromUserWithEmail(email, sensor_id);
            return res.status(200).json({ message: `Removed ${sensor_id} from user with email ${email}.` });
        } else {
            return res.status(400).json({ error: 'Invalid arguments.' });
        }
    }
    
    if (alert_id) {
        if (username) {
            await users_api.removeAlertFromUserWithUsername(username, alert_id);
            return res.status(200).json({ message: `Removed ${alert_id} from user with name ${username}.` });
        } else if (email) {
            await users_api.removeAlertFromUserWithEmail(email, alert_id);
            return res.status(200).json({ message: `Removed ${alert_id} from user with email ${email}.` });
        } else {
            return res.status(400).json({ error: 'Invalid arguments.' });
        }
    }

    if (user_id) {
        if (await users_api.deleteUser(user_id)) {
            return res.status(200).json({ message: 'User deleted successfully.' });
        } else {
            return res.status(500).json({ message: 'Error deleting user.' });
        }
    }

    return res.status(400).json({ error: 'Invalid arguments.' });

});

router.put("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const username = req.query.username;
    const email = req.query.email;
    const sensor_id = req.query.sensor_id;
    const alert_id = req.query.alert_id;

    if (sensor_id) {
        if (username) {
            await users_api.addSensorToUserWithUsername(username, sensor_id);
            return res.status(200).json({ message: `Added ${sensor_id} to user with name ${username}.` });
        } else if (email) {
            await users_api.addSensorToUserWithEmail(email, sensor_id);
            return res.status(200).json({ message: `Added ${sensor_id} to user with email ${email}.` });
        } else {
            return res.status(400).json({ error: 'Invalid arguments.' });
        }
    }
    
    if (alert_id) {
        if (username) {
            await users_api.addAlertToUserWithUsername(username, alert_id);
            return res.status(200).json({ message: `Added ${alert_id} to user with name ${name}.` });
        } else if (email) {
            await users_api.addAlertToUserWithEmail(email, alert_id);
            return res.status(200).json({ message: `Added ${alert_id} to user with email ${email}.` });
        } else {
            return res.status(400).json({ error: 'Invalid arguments.' });
        }
    }

    return res.status(400).json({ error: 'Invalid arguments.' });

});

//router.put("/:user_id/:name/:email/:phone_number/:company_name/updateUser", limiter, async (req, res, next) => {
router.put("/:user_id/update", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);
    const name = String(req.query.name);
    const email = String(req.query.email);
    const phone_number = String(req.query.phone_number);
    const company_name = String(req.query.company_name);

    if ( user_Id === NaN || !name || !email || !phone_number || !company_name) {
        return res.status(400).json({error: `Invalid arguments`})
    } else {
        await users_api.updateUser(user_Id,name,email,phone_number,company_name);
        return res.status(200).json({message: `Updated user ${user_Id}`});
    }
});    

module.exports = router;