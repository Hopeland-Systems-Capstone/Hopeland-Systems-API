const express = require("express");
const router = express.Router();
const limiter = require('./rate_limit/rate_limiting').limiter
const users_api = require('../api/users_api');
const api_key_util = require('./util/api_key_util');

//GET | /users/username/:username?key=apikey | Return user_id given username
//GET | /users/email/:email?key=apikey | Return user_id given email
//GET | /users/:user_id?key=apikey | Return user information given user_id
//GET | /users/:user_id/password/:hashed_password?key=apikey
//GET | /users/:user_id/cards?key=val | Get all cards on file for a user
//GET | /users/:user_id/activeCard?key=val | Get the active card for a user
//GET | /users/:user_id/timezone | Get timezone for a user
//POST | /users/:user_id/cards?cardNumber=cardNumber&nameOnCard=nameOnCard&cardExpiration=cardExpiration&cvc=cvc&address1=address1&address2=address2&city=city&state=state&country=country&zip=zip | Add a card for a user
//POST | /users/:user_id/cards/:card_id/update?cardNumber=cardNumber&nameOnCard=nameOnCard&cardExpiration=cardExpiration&cvc=cvc&address1=address1&address2=address2&city=city&state=state&country=country&zip=zip | Update a card for a user
//GET | /users/:user_id/bills | Returns list of bills belonging to the indicated user_id |
//GET | /users/:user_id/alarmRecipients | Returns list of alarm recipients belonging to the indicated user_id |
//GET | /users/:user_id/alarmRecipients/:alarm_recipient_id/enabled | Returns whether an alarm recipient, given its alarm_recipient_id and associated user_id, is enabled |
//GET | /users/user_id/alerts?key=val| Return Alerts for user with `user_id`
//GET | /users/user_id/email?key=val | Return Email for user with `user_id`
//GET | /users/user_id/name?key=val | Return Name for user with `user_id`
//GET | /users/user_id/companyName?key=val | Return Company Name for user with `user_id`
//GET | /users/user_id/phoneNumber?key=val | Return Phone Number for user with `user_id`
//GET | /users/:user_id/sensors/countOnline?key=val | Return amount of online sensors for user `user_id`
//GET | /users/:user_id/sensors/countOffline?key=val | Return amount of offline sensors for user `user_id`
//GET | /users/:user_id/sensors | Return all sensors a user has access to
//POST | /users?key=apikey&username=name&email=email&hashed_password=hashed_password&phone_number=0000000000&company_name=Hopeland&timezone=MST | Create new user given username, email, hashed_password (Optional phone_number, company_name, and timezone)
//POST | /users/:user_id/bills?billing_date=val&amount=val | Creates a new bill and adds bill to an indicated user_id given billing_date and amount |
//POST | /users/:user_id/alarmRecipients?name=val&email=val | Creates a new alarm recipient and adds alarm recipient to an indicated user_id given name and email|
//DELETE | /users/:user_id?key=apikey | Delete user give user_id
//DELETE | /users/:user_id/sensor/:sensor_id?key=apikey | Delete sensor from user when given user_id and sensor_id
//DELETE | /users/:user_id/alert/:alert_id?key=apikey | Delete alert from user when given user_id and alert_id
//DELETE | /users/:user_id/cards/:card_id?key=val | Delete a card for a user
//DELETE | /users/:user_id/bills/:bill_id | Deletes the bill with a given bill_id from the indicated user_id |
//DELETE | /users/:user_id/alarmRecipients/:alarm_recipient_id | Deletes the alarm recipient with a given alarm_recipient_id from the indicated user_id |
//PUT | /users/:user_id/sensor/:sensor_id?key=apikey | Add sensor to user when given user_id and sensor_id
//PUT | /users/:user_id/alert/:alert_id?key=apikey | Add alert to user when given user_id and alert_id
//PUT | /users/:user_id/password?key=val&new=new_password&old=old_password | Update password for user
//PUT | /users/:user_id/timezone/:timezone?key=val | Set timezone for a user
//PUT | /users/:user_id/activeCard/:card_id?key=val | Set the active card for a user
//PUT | /users/:user_id/bills/:bill_id/update?status=val | Updates the bill when given status |
//PUT | /users/:user_id/alarmRecipients/:alarm_recipient_id/enabled/:enabled | Updates the alarm recipient when given enabled (must be true or false) |
//PUT | /users/user_id/update?name=name&email=email&phone_number=phone_number&company_name=company_name&key=val | Update user's `user_id` name, email, phone number, company name

router.get("/username/:username", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const username = req.params.username;

    if (!username) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    const user_id = await users_api.getUserByUsername(username);
    return res.status(200).json(user_id);

});

router.get("/email/:email", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const email = req.params.email;

    if (!email) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    const user_id = await users_api.getUserByEmail(email);
    return res.status(200).json(user_id);

});

router.get("/:user_id", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);

    if (typeof user_id == 'undefined' || user_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    const user = await users_api.getUser(user_id);
    return res.status(200).json(user);

});

router.get("/:user_id/password/:hashed_password", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const hashed_password = req.params.hashed_password;

    if (typeof user_id == 'undefined' || user_id === NaN || !hashed_password) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    const valid = await users_api.verifyUserPassword(user_id, hashed_password);
    return res.status(200).json(valid);
});

router.post("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

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

router.delete("/:user_id", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);

    if (typeof user_id == 'undefined' || user_id == NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    if (await users_api.deleteUser(user_id)) {
        return res.status(200).json({ message: 'User deleted successfully.' });
    } else {
        return res.status(500).json({ message: 'Error deleting user.' });
    }

});

router.delete("/:user_id/sensor/:sensor_id", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const sensor_id = parseInt(req.params.sensor_id);

    if (typeof user_id == 'undefined' || user_id == NaN || typeof sensor_id == 'undefined' || sensor_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    await users_api.removeSensorFromUser(user_id, sensor_id);
    return res.status(200).json({ message: `Removed ${sensor_id} from user with id ${user_id}.` });

});

router.delete("/:user_id/alert/:alert_id", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const alert_id = parseInt(req.params.alert_id);

    if (typeof user_id == 'undefined' || user_id == NaN || typeof alert_id == 'undefined' || alert_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    await users_api.removeAlertFromUser(user_id, alert_id);
    return res.status(200).json({ message: `Removed ${alert_id} from user with id ${user_id}.` });

});

router.put("/:user_id/sensor/:sensor_id", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const sensor_id = parseInt(req.params.sensor_id);

    if (typeof user_id == 'undefined' || user_id === NaN || typeof sensor_id == 'undefined' || sensor_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    await users_api.addSensorToUser(user_id, sensor_id);
    return res.status(200).json({ message: `Added sensor ${sensor_id} to user with id ${user_id}.` });

});

router.put("/:user_id/alert/:alert_id", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const alert_id = parseInt(req.params.alert_id);

    if (typeof user_id == 'undefined' || user_id === NaN || typeof alert_id == 'undefined' || alert_id === NaN) {
        console.log("Failed");
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    await users_api.addAlertToUser(user_id, alert_id);
    return res.status(200).json({ message: `Added alert ${alert_id} to user with id ${user_id}.` });

});

router.get("/:user_id/timezone", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);

    if (typeof user_id != 'undefined') {
        const timezone = await users_api.getTimezone(user_id);
        return res.status(200).json(timezone);
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

router.get("/:user_id/activeCard", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);

    if (typeof user_id != 'undefined') {
        const activeCard = await users_api.getActiveCard(user_id);
        return res.status(200).json(activeCard);
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

router.get("/:user_id/cards", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);

    if (typeof user_id != 'undefined') {
        const cards = await users_api.getCards(user_id);
        console.log(cards);
        return res.status(200).json(cards);
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

router.post("/:user_id/cards", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const card_number = req.query.cardNumber;
    const name_on_card = req.query.nameOnCard;
    const card_expiration = req.query.cardExpiration;
    const cvc = req.query.cvc;
    const address1 = req.query.address1;
    const address2 = req.query.address2;
    const city = req.query.city;
    const state = req.query.state;
    const country = req.query.country;
    const zip = req.query.zip;

    if (typeof user_id == 'undefined' || !card_number || !name_on_card || !card_expiration || !cvc || !address1 || !city || !state || !country || !zip) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    try {
        await users_api.addCard(user_id, card_number, name_on_card, card_expiration, cvc, address1, address2, city, state, country, zip)
        return res.status(201).json({ message: 'Card created successfully.' });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error adding card to user.' });
    }
});

router.delete("/:user_id/cards/:card_id", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const card_id = parseInt(req.params.card_id);

    if (typeof user_id != 'undefined' && typeof card_id != 'undefined') {
        await users_api.deleteCard(user_id, card_id);
        return res.status(200).json({ message: 'Deleted card successfully.' });
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

router.put("/:user_id/activeCard/:card_id", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const card_id = parseInt(req.params.card_id);

    if (typeof user_id != 'undefined' && typeof card_id != 'undefined') {
        await users_api.setActiveCard(user_id, card_id)
        return res.status(200).json({ message: 'Set active card successfully.' });
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

router.post("/:user_id/cards/:card_id/update", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const card_id = parseInt(req.params.card_id);
    const card_number = req.query.cardNumber;
    const name_on_card = req.query.nameOnCard;
    const card_expiration = req.query.cardExpiration;
    const cvc = req.query.cvc;
    const address1 = req.query.address1;
    const address2 = req.query.address2;
    const city = req.query.city;
    const state = req.query.state;
    const country = req.query.country;
    const zip = req.query.zip;

    if (typeof user_id == 'undefined' || !card_number || !name_on_card || !card_expiration || !cvc || !address1 || !city || !state || !country || !zip) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    try {
        await users_api.updateCard(user_id, card_id, card_number, name_on_card, card_expiration, cvc, address1, address2, city, state, country, zip);
        return res.status(201).json({ message: 'Card updated successfully.' });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error adding card to user.' });
    }
});

router.put("/:user_id/timezone/:timezone", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const timezone = req.params.timezone;


    if (typeof user_id != 'undefined' && timezone) {
        if (await users_api.setTimezone(user_id, timezone)) {
            return res.status(201).json({ message: 'Timezone updated successfully.' });
        } else {
            return res.status(500).json({ message: 'Error updating timezone.' });
        }
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

router.put("/:user_id/password", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const old_hashed_password = req.query.new;
    const new_hashed_password = req.query.old;

    if (typeof user_id != 'undefined' && new_hashed_password && old_hashed_password) {

        if (await users_api.updatePassword(user_id, old_hashed_password, new_hashed_password)) {
            return res.status(201).json({ message: 'Password updated successfully.' });
        } else {
            return res.status(500).json({ message: 'Error updating password.' });
        }

    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

router.get('/:user_id/sensors', async (req, res) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);
   
    if (user_Id === NaN) {
        res.status(400).send('Invalid arguments');
    } else {
        const data = await users_api.getUserSensors(user_Id);
        res.status(200).json(data);
    }
});

router.get('/:user_id/sensors/countOffline', async (req, res) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);
   
    if (user_Id === NaN) {
        res.status(400).send('Invalid arguments');
    } else {
        const data = await users_api.countOffline(user_Id);
        res.status(200).json(data);
    }
});

router.get('/:user_id/sensors/countOnline', async (req, res) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);
    
    if (user_Id === NaN) {
        res.status(400).send('Invalid arguments');
    } else {
        const data = await users_api.countOnline(user_Id);
        res.status(200).json(data);
    }
});

router.get("/:user_id/phoneNumber", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);

    if ( user_Id === NaN) {
        return res.status(400).json({error: `Invalid arguments`})
    } else {
        const data = await users_api.getPhoneNumber(user_Id);
        return res.status(200).json(data);
    }

});

router.get("/:user_id/companyName", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);

    if ( user_Id === NaN) {
        return res.status(400).json({error: `Invalid arguments`})
    } else {
        const data = await users_api.getCompanyName(user_Id);
        return res.status(200).json(data);
    }

});

router.get("/:user_id/name", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);

    if ( user_Id === NaN) {
        return res.status(400).json({error: `Invalid arguments`})
    } else {
        const data = await users_api.getName(user_Id);
        return res.status(200).json(data);
    }

});

router.get("/:user_id/email", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);

    if ( user_Id === NaN) {
        return res.status(400).json({error: `Invalid arguments`})
    } else {
        const data = await users_api.getEmail(user_Id);
        return res.status(200).json(data);
    }

});

router.get("/:user_id/alerts", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);

    if ( user_Id === NaN) {
        return res.status(400).json({error: `Invalid arguments`})
    } else {
        const data = await users_api.getAlerts(user_Id);
        return res.status(200).json(data);
    }

});

router.post("/:user_id/bills", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const billing_date = parseInt(req.query.billing_date);
    const amount = parseFloat(req.query.amount);

    if (user_id === NaN || amount === NaN || billing_date === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.createBill(user_id, billing_date, amount);
        return res.status(200).json({ message: `Created a new bill for $${amount} and added to user with id ${user_id}` });
    }
});

router.put("/:user_id/bills/:bill_id/update", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const bill_id = parseInt(req.params.bill_id);
    const status = req.query.status;

    if (user_id === NaN || bill_id === NaN || !status) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.updateBill(user_id, bill_id, status);
        return res.status(200).json({ message: `Updated bill with id ${bill_id} for user with id ${user_id} to the status of ${status}`});
    }
});

router.delete("/:user_id/bills/:bill_id", limiter, async (req, res, next) => {

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

router.get("/:user_id/bills", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);

    if (user_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        const bills = await users_api.getBills(user_id)
        return res.status(200).json(bills);
    }
});

router.post("/:user_id/alarmRecipients", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const name = req.query.name;
    const email = req.query.email;

    if (user_id === NaN || !name || !email) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.addAlarmRecipient(user_id, name, email);
        return res.status(200).json({ 
            message: `Added ${name} with email ${email} to alarm recipients of user with id ${user_id}`
        });
    }
});

router.delete("/:user_id/alarmRecipients/:alarm_recipient_id", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const recipient_id = parseInt(req.params.alarm_recipient_id);

    if (user_id === NaN || recipient_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.deleteAlarmRecipient(user_id, recipient_id);
        return res.status(200).json({ 
            message: `Removed alarm recipient with id ${recipient_id} from user with id ${user_id}`
        });
    }    
});

router.get("/:user_id/alarmRecipients", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);

    if (user_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        const recipients = await users_api.getAlarmRecipients(user_id);
        return res.status(200).json(recipients);
    }
});

router.get("/:user_id/alarmRecipients/:alarm_recipient_id/enabled", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const recipient_id = parseInt(req.params.alarm_recipient_id);

    if (user_id === NaN || recipient_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        const status = await users_api.getAlarmRecipientStatus(user_id, recipient_id);
        return res.status(200).json(status);
    }    
});

router.put("/:user_id/alarmRecipients/:alarm_recipient_id/enabled/:enabled", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const recipient_id = parseInt(req.params.alarm_recipient_id);
    const enabled = req.params.enabled === "false" ? false : (req.params.enabled === "true" ? true : -1);

    if (user_id === NaN || recipient_id === NaN || enabled === -1) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.setAlarmRecipientStatus(user_id, recipient_id, enabled);
        return res.status(200).json({ 
            message: `Set status of alarm recipient with id ${recipient_id} from user with id ${user_id} to ${enabled}`
        });
    }    
});
router.put("/:user_id/update", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_Id = parseInt(req.params.user_id);
    const name = String(req.query.name);
    const email = String(req.query.email);
    const phone_number = String(req.query.phone_number);
    const company_name = String(req.query.company_name);

    console.log(user_Id + name + email);

    if ( user_Id === NaN || !name || !email || !phone_number || !company_name) {
        return res.status(400).json({error: `Invalid arguments`})
    } else {
        await users_api.updateUser(user_Id,name,email,phone_number,company_name);
        return res.status(200).json({message: `Updated user ${user_Id}`});
    }
});

module.exports = router;