const fs = require('fs')

module.exports = async config => {
    if (!config.db || config.db === '') {
        console.error("Invalid 'db' value in config.")
        process.exit(2)
    }

    if (fs.existsSync(__dirname + '/databases/' + config.db + '.js')) {
        db = require('./databases/' + config.db)
        await db.init(config.db_options)
        return db
    } else {
        console.error("Invalid 'db' value in config.")
        process.exit(2)
    }
}