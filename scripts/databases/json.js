const JsonDB = require('node-json-db').JsonDB
const Config = require('node-json-db/dist/lib/JsonDBConfig').Config

const genRandom = () => Math.random().toString(36).substring(7)

var db;

module.exports = {

    get: id => {
        try {
            return db.getData('/' + id)
        } catch(e) {
            return null
        }
    },
    getall: filter => {
        let alldataraw = db.getData('/')
        let alldata = Object.keys(alldataraw).map(k => Object.assign(alldataraw[k], {id: k}))
        return alldata.filter(d => !Object.keys(filter).map(k => d[k] === filter[k]).includes(false))
    },
    insert: data => {
        let id = data.id || genRandom()
        while (module.exports.get(id)) id = genRandom()
        if (data.id) delete data.id
        db.push('/' + id, data)
        return id
    },
    update: (id, data) => db.push('/' + id, data, false),
    delete: id => db.delete('/' + id),

    init: () => db = new JsonDB(new Config('cache/jdb', true, false, '/'))

}