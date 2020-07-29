const ytdl = require('ytdl-core')
const fs = require('fs')

module.exports = (url, itag, path) => new Promise((resolve, reject) => {
    ytdl(url, { filter: f => f.itag === itag })
        .on('error', err => reject(err))
        .pipe(fs.createWriteStream(path))
        .on('finish', () => resolve())
})