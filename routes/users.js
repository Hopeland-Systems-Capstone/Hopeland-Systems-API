const express = require("express");
const router = express.Router();
const limiter = require('./rate_limit/rate_limiting').limiter
const users_api = require('../api/users_api');
const api_key_util = require('./util/api_key_util');

//GET / Return user information
//POST / Create a user with name, email, pw
//DELETE / Delete a user
//PUT / Update user || Dont't see update method in users_api, will do put later.


//Modify this so that each different get in users_api is able to be called
router.get("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const name = req.query.name;
    if (name) {
        const user = await users_api.getUserByUsername(name);
        return res.status(200).json(user);
    }

    const email = req.query.email;
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

    if (!name) {
        return res.status(400).json({ error: 'Invalid argument, check name.' });
    }

    if (await users_api.deleteUser(name)) {
        return res.status(200).json({ message: 'User deleted successfully.' });
    } else {
        return res.status(500).json({ message: 'Error deleting User.' });
    }
});



