module.exports = async() => {

    const config = require('./config')

    const db = await require('./database')(config)

    const express = require('express')
    const app = express()

    app.use(express.static('public'))
    app.use('/dl', express.static(config.cachedir))
    app.use(express.json())
    app.set('trust proxy', 1)

    const mainRouter = require('./routers/main')(config, db)
    app.use(mainRouter)

    const apiRouter = require('./routers/api')(config, db)
    app.use('/api', apiRouter)

    const queue = require('./queue')
    setInterval(() => queue(config, db), 1000 * 60)
    queue(config, db)

    app.listen(config.port, () => console.log('ytmp3 started on localhost:' + config.port))

}