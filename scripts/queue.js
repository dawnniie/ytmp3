const fs = require('fs')
const path = require('path')

module.exports = async(config, db) => {
    let tasks = await db.getall({"status": "complete"})

    const deleteTask = async id => {
        let dir = path.join(__dirname, '../') + '/cache/' + id
        fs.readdirSync(dir).forEach(f => fs.unlinkSync(dir + '/' + f))
        fs.rmdirSync(dir)
        await db.delete(id)
    }

    for (const t of tasks) {
        let size = "xsmall"
        if (t.size > 1000000) size = "small"
        if (t.size > 10000000) size = "medium"
        if (t.size > 100000000) size = "large"
        if (t.size > 1000000000) size = "xlarge"

        let expiretime = t.time + (config.autodelete[size] * 60 * 60 * 1000)
        if (Date.now() > expiretime) await deleteTask(t.id)
    }

    let inctasks = await db.getall({})
    inctasks.filter(t => !tasks.includes(t))

    for (const t of inctasks) {
        let expiretime = t.time + (config.autodelete['incomplete'] * 60 * 60 * 1000)
        if (Date.now() > expiretime) await deleteTask(t.id)
    }
}