const DEFAULT_CONFIG = {
    "port": 8080,
    "db": "json",
    "db_options": {},
    "cachedir": "cache",
    "autodelete": {
        "xsmall": 24 * 14,
        "small": 24 * 7,
        "medium": 24,
        "large": 12,
        "xlarge": 1,
        "incomplete": 24
    },
    "maxsize": 1000 * 1000 * 1000 * 10, // 10 gigabyes
}

const SUPPLIED_CONFIG = require('../config.json')
module.exports = Object.assign(DEFAULT_CONFIG, SUPPLIED_CONFIG)