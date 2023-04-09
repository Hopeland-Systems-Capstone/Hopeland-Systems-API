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
//PUT | /users/:user_id/:amount/createBill?key=apikey | Add a bill to user's bill array for the given amount.
//PUT | /users/:user_id/:bill_id/:status/updateBill?key=apikey | Update the status of a bill to the given status.
//DELETE | /users/:user_id/:bill_id/deleteBill?key=apikey | Delete the bill of a given id from the user of a given id.
//GET | /users/:user_id/getBills?key=apikey | Retrieve the array of all of a given user's bills.
//PUT | /users/:user_id/:name/:email/addAlarmRecipient?key=apikey | Adds an alarm recipient with a given name and email to a given user.
//DELETE | /users/:user_id/:recipient_id/deleteAlarmRecipient?key=apikey | Deletes an alarm recipient with a given id from a given user.
//GET | /users/:user_id/getAlarmRecipients?key=apikey | Retrieves the array of all alarm recipients from the user with a given id.
//GET | /users/:user_id/:recipient_id/getAlarmRecipientStatus?key=apikey | Returns the status of the alarm recipient with a given id belonging to the user of a given id.
//PUT | /users/:user_id.:recipient_id/:status/setAlarmRecipientStatus?key=apikey | Sets the status of the alarm recipient with a given id belonging to the user of a given id.


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

router.put("/:user_id/:amount/createBill", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const amount = parseFloat(req.params.amount);
    const time = Date.now();

    if (user_id === NaN || !amount) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.createBill(user_id, time, amount);
        return res.status(200).json({ message: `Created a new bill for $${amount} added to user with id ${user_id}` });
    }
});

router.put("/:user_id/:bill_id/:status/updateBill", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const bill_id = parseInt(req.params.bill_id);
    const status = req.params.status;

    if (user_id === NaN || bill_id === NaN || !status) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.updateBill(user_id, bill_id, status);
        return res.status(200).json({ message: `Updated bill with id ${bill_id} for user with id ${user_id} to the status of ${status}`});
    }
});

router.delete("/:user_id/:bill_id/deleteBill", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const bill_id = parseInt(req.params.bill_id);

    if (user_id === NaN || bill_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.deleteBill(user_id, bill_id);
        return res.status(200).json({ message: `Deleted bill with id ${bill_id}`});
    }
});

router.get("/:user_id/getBills", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);

    if (user_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        const bills = await users_api.getBills(user_id)
        return res.status(200).json(bills);
    }
});

router.put("/:user_id/:name/:email/addAlarmRecipient", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const name = req.params.name;
    const email = req.params.email;

    if (user_id === NaN || !name || !email) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.addAlarmRecipient(user_id, name, email);
        return res.status(200).json({ 
            message: `Added ${name} with email ${email} to alarm recipients of user with id ${user_id}`
        });
    }
});

router.delete("/:user_id/:recipient_id/deleteAlarmRecipient", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const recipient_id = parseInt(req.params.recipient_id);

    if (user_id === NaN || recipient_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.deleteAlarmRecipient(user_id, recipient_id);
        return res.status(200).json({ 
            message: `Removed alarm recipient with id ${recipient_id} from user with id ${user_id}`
        });
    }    
});

router.get("/:user_id/getAlarmRecipients", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);

    if (user_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        const recipients = await users_api.getAlarmRecipients(user_id);
        return res.status(200).json(recipients);
    }
});

router.get("/:user_id/:recipient_id/getAlarmRecipientStatus", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const recipient_id = parseInt(req.params.recipient_id);

    if (user_id === NaN || recipient_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        const status = await users_api.getAlarmRecipientStatus(user_id, recipient_id);
        return res.status(200).json(status);
    }    
});

router.put("/:user_id/:recipient_id/:status/setAlarmRecipientStatus", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const recipient_id = parseInt(req.params.recipient_id);
    const status = req.params.status === "false" ? false : (req.params.status === "true" ? true : -1);

    if (user_id === NaN || recipient_id === NaN || status === -1) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.setAlarmRecipientStatus(user_id, recipient_id, status);
        return res.status(200).json({ 
            message: `Set status of alarm recipient with id ${recipient_id} from user with id ${user_id} to ${status}`
        });
    }    
});

module.exports = router;