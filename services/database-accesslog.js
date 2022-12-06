const database = require('better-sqlite3')

const fs = require('fs');
const datadir = './data/';

// Checking to see if the database exists
if (!fs.existsSync(datadir)){
    fs.mkdirSync(datadir);
}

const logdb = new database(datadir+'log.db')

// Initializin a new access log to keep track of the user info
const stmt = logdb.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`)
let row = stmt.get();
if (row === undefined) {
    console.log('Log database appears to be empty. Creating log database...')

    const sqlInit = `
        CREATE TABLE accesslog ( 
            id INTEGER PRIMARY KEY, 
            remoteaddr TEXT,
            remoteuser TEXT,
            time TEXT,
            method TEXT,
            url TEXT,
            protocol TEXT,
            httpversion TEXT,
            status TEXT, 
            referrer TEXT,
            useragent TEXT
        );
    `

    logdb.exec(sqlInit)
} else {
    console.log('Log database exists.')
}

module.exports = logdb
