const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')

module.exports = async(dir, name, a = false, v = false) => new Promise(async(resolve, reject) => {
    if (!dir || !fs.existsSync(dir)) reject('invalid-directory')
    if (!name) reject('invalid-name')
    if (!a && !v) reject('invalid-arguments')

    const dat = {}
    const dircontents = fs.readdirSync(dir)

    dircontents.forEach(dirc => {
        if (dirc.startsWith('AUD')) dat.audiopath = `${dir}/${dirc}`
        if (dirc.startsWith('VID')) dat.videopath = `${dir}/${dirc}`
    })

    if (a && !dat.audiopath) reject('no-audio-file')
    if (v && !dat.videopath) reject('no-video-file')

    if (a && !v) {
        let finalpath = `${dir}/${name}.mp3`
        if (!dat.audiopath.endsWith('.mp3')) await ffmpeg(dat.audiopath).format('mp3').save(finalpath)
        else fs.renameSync(dat.audiopath, finalpath)
        resolve(finalpath)
    } else if (!a && v) {
        let finalpath = `${dir}/${name}.mp4`
        if (!dat.videopath.endsWith('.mp4')) await ffmpeg(dat.videopath).format('mp4').save(finalpath)
        else fs.renameSync(dat.videopath, finalpath)
        resolve(finalpath)
    } else if (a && v) {
        let finalpath = `${dir}/${name}.mp4`
        await ffmpeg(dat.audiopath)
        .input(dat.videopath)
        .format('mp4')
        .save(finalpath)
        .on('end', () => resolve(finalpath))
    }
})