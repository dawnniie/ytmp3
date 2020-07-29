const r = require('rethinkdb')
let rconn = null

const DEFAULT_CONFIG = {
    "host": "localhost",
    "port": 28015,
    "db": "ytmp3",
    "required_tables": ["tasks"]
}

module.exports = {

    get: id => r.table('tasks').get(id).run(rconn),
    getall: filter => r.table('tasks').filter(filter).run(rconn).then(curs => curs.toArray()),
    insert: async data => {
        const res = await r.table('tasks').insert(data).run(rconn)
        return res.generated_keys[0]
    },
    update: (id, data) => r.table('tasks').filter({id: id}).update(data).run(rconn),
    delete: id => r.table('tasks').filter({id: id}).delete().run(rconn),

    init: config => new Promise((resolve, reject) => {
        /**
         * rethinkdb-connect.js (adapted version)
         * Populates a rethinkdb instance with a database and required tables if they don't already exist.
         * Designed for single-database applications.
         */

        config = Object.assign(DEFAULT_CONFIG, config)
        var required_tables = config.required_tables
        delete config.required_tables
    
        var configclone = JSON.parse(JSON.stringify(config))
        if (configclone.db) delete configclone.db
    
        r.connect(configclone, async(err, connection) => {
            if (err) return reject(err)
    
            await r
            .dbList()
            .contains(config.db)
            .do(db_exists => r.branch( 
                db_exists,
                null,
                r.dbCreate(config.db)
            ))
            .run(connection)
            .catch(err => reject(err))
    
            await connection.close().catch(err => reject(err))
            r.connect(config, async(err, final_connection) => {
                if (err) return reject(err)
    
                let db_tables = await r.tableList().run(final_connection).catch(err => reject(err))
                let missing_tables = required_tables.filter(t => !db_tables.includes(t))
                for (table of missing_tables) await r.tableCreate(table).run(final_connection).catch(err => reject(err))
    
                rconn = final_connection
                resolve()
            })
        })
    })

}