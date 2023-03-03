async function checkKey(res,key) {
    if (key == null) {
        res.send("Request an API key")
        return false;
    }

    const apikeys_api = require('../../api/apikeys_api');
    const valid = await apikeys_api.keyExists(`${key}`);

    if (!valid) {
        res.send("Invalid API key");
        return false;
    }
    return true;
}

module.exports = {
  checkKey: checkKey,
};