const express = require('express')
const fs = require('fs')
const path = require('path')
const ytdl = require('ytdl-core')

const proc_pi = require('./pipe')

// a function is used so that we can provide routers with database and config access
module.exports = (config, db) => {

    const router = express.Router()

    router.post('/info', async(req, res) => {
        if (!req.body.input) return res.send({"err": "invalid-input"})
    
        try {
            let dat = await ytdl.getInfo(req.body.input)
            return res.send(dat)
        } catch(e) {
            return res.send({"err": "invalid-id"})
        }
    })

    router.post('/convert', async(req, res) => {
        if (!req.body.url) return res.send({"err": "missing-url"})
        if (!req.body.aitag && !req.body.vitag) return res.send({"err": "missing-itags"})

        let aitag = req.body.aitag
        let vitag = req.body.vitag

        let dat;
        let url = req.body.url
        try {
            dat = await ytdl.getInfo(url)
        } catch(e) {
            return res.send({"err": "invalid-id", "also": e})
        }

        let ainfo = dat.formats.find(fmt => fmt.itag === aitag)
        if (aitag && !ainfo) return res.send({"err": "invalid-aitag"})
        let vinfo = dat.formats.find(fmt => fmt.itag === vitag)
        if (vitag && !vinfo) return res.send({"err": "invalid-vitag"})

        function getSize(stream) {
            let br = (stream.averageBitrate || stream.bitrate || (stream.audioBitrate * 1000) || 0)
            let len = (Number(stream.approxDurationMs) / 1000) || Number(info.length_seconds) || 0
            return br * len / 8
        }

        let sizes = {}
        if (aitag) sizes.a = getSize(ainfo)
        if (vitag) sizes.v = getSize(vinfo)
        if (aitag && vitag) sizes.total = sizes.a + sizes.v
        else sizes.total = sizes.a || sizes.v

        if (sizes.total > config.maxsize) return res.send({"err": "conversion-too-big"})

        let type = ((aitag) ? 'a':'') + ((vitag) ? 'v':'')

        let id = await db.insert({
            url: url,
            title: dat.title,
            type: type,
            aitag: aitag,
            vitag: vitag,
            time: Date.now(),
            status: 'preparing'
        })

        res.send({"id": id})

        let cpath = path.join(__dirname, '../../') + '/' + config.cachedir
        if (!fs.existsSync(cpath)) fs.mkdirSync(cpath)
        let vpath = cpath + '/' + id
        fs.mkdirSync(vpath)

        let smallest = 'a'
        if (aitag && vitag) smallest = (sizes.a < sizes.v) ? 'a' : 'v'

        await db.update(id, {status: 'processing'})

        let fpath = await proc_pi(url, vpath + '/', dat.title, aitag, vitag, smallest)
        let size = fs.statSync(fpath).size
        fpath = '/dl' + fpath.split(config.cachedir)[1]

        await db.update(id, {status: 'complete', dlurl: fpath, size: size})

        fs.readdirSync(vpath)
        .filter(f => f.includes('SMALL'))
        .forEach(f => fs.unlinkSync(vpath + '/' + f))
    })

    router.post('/dl/:id', async(req, res) => {
        const dat = await db.get(req.params.id)
        if (!dat) return res.send({'err': 'invalid-id'})
        return res.send(dat)
    })

    return router

}