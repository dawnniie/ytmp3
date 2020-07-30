const ytdl = require('ytdl-core')
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')

const asyncPipe = (readStr, writeStr) => new Promise((resolve, reject) => {
    readStr.pipe(writeStr).on('error', err => reject(err)).on('finish', () => resolve())
})

module.exports = (url, dir, name, aitag = null, vitag = null, smallest = 'a') => new Promise(async(resolve, reject) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)

    let format = (vitag) ? 'mp4' : 'mp3'
    let save = dir + name + '.' + format

    let astream;
    let vstream;

    if (aitag) astream = ytdl(url, { filter: f => f.itag === aitag })
    if (vitag) vstream = ytdl(url, { filter: f => f.itag === vitag })

    if ((aitag && !vitag) || (!aitag && vitag)) {
        let stream = (aitag) ? astream : vstream
        if (aitag) ffmpeg(stream).format(format).save(save).on('end', () => resolve(save))
        if (vitag) ffmpeg(stream).noAudio().format(format).save(save).on('end', () => resolve(save))
    }

    if (aitag && vitag) {
        let smallstream = (smallest === 'a') ? astream : vstream
        let smallformat = (smallest === 'a') ? 'mp3' : 'mp4'
        await asyncPipe(smallstream, fs.createWriteStream(dir + 'SMALL.' + smallformat)).catch(err => reject(err))
        
        let bigstream = (smallest === 'a') ? vstream : astream
        ffmpeg(bigstream).input(dir + 'SMALL.' + smallformat).format('mp4').save(save).on('end', () => resolve(save))
    }

})