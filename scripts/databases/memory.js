let memdata = []

const genRandom = () => Math.random().toString(36).substring(7)

module.exports = {

    get: id => memdata.find(d => d.id === id),
    getall: filter => memdata.filter(d => !Object.keys(filter).map(k => d[k] === filter[k]).includes(false)),
    insert: data => {
        if (!data.id) data.id = genRandom()
        while (module.exports.get(data.id)) data.id = genRandom()
        memdata.push(data)
        return data.id
    },
    update: (id, data) => module.exports.getall({id: id}).forEach(d => Object.keys(data).forEach(k => d[k] = data[k])),
    delete: id => {
        let idx = memdata.findIndex(d => d.id === id)
        if (idx > -1) memdata.splice(idx, 1)
    },

    init: () => true

}