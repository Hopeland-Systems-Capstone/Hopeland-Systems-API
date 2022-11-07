//Rate Limiting 3600 requests/hr (Limits at 10 requests every 10 seconds), or unlimited requests for level 0 keys
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    max : async (req, res) => { return (await getKeyLevelLimit(req.query.key)) },
    windowMs : 10000
});

const getKeyLevelLimit = async (key) => {
	const apikeys_api = require('../../api/apikeys_api');
    const level = await apikeys_api.getKeyLevel(`${key}`);
    if (level == -1) {
        return 0;
    } else if (level == 1) {
        return 10;
    } else if (level == 0) {
        return Infinity;
    }
}

module.exports.limiter = limiter;