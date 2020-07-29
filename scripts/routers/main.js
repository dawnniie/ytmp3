const express = require('express')
const fs = require('fs')
const path = require('path')

// a function is used so that we can provide routers with database and config access
module.exports = (config, db) => {

    const router = express.Router()

    router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../../') + '/html/home.html'))

    router.get('/c/:id', async(req, res) => {
        const dat = await db.get(req.params.id)
        if (!dat) return res.send('nothing here')//return res.redirect('/')
        return res.send(fs.readFileSync(path.join(__dirname, '../../') + '/html/convert.html', 'utf-8').replace('null/*DAT*/', JSON.stringify(dat)))
    })

    return router

}