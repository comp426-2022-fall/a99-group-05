const args = require('minimist')(process.argv.slice(2))

const help = (`
server.js [options]
--port, -p	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.
--debug, -d If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help, -h	Return this message and exit.
`)
// If --help, echo help text and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

// creating app using express
var express = require('express')
var app = express()

const fs = require('fs')
const morgan = require('morgan')
const logdb = require('./services/database-accesslog.js')
const userdb = require('./services/database-users.js')

// json body messages and express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Server port
const port = args.port || args.p || process.env.PORT || 5000
// If --log=false then do not create a log file
if (args.log == 'false') {
    console.log("NOTICE: not creating file access.log")
} else {
// Use morgan for logging to files
    const logdir = './log/';
    // if no logdir then create
    if (!fs.existsSync(logdir)){
        fs.mkdirSync(logdir);
    }
// Create a write stream to append to an access.log file
    const accessLog = fs.createWriteStream(logdir+'access.log', { flags: 'a' })
// Set up the access logging middleware
    app.use(morgan('combined', { stream: accessLog }))
}

// Spin the wheel once with a user bet
function wheelSpin(bet) {
    // All multiples on the wheel
    let array = [0.25, 0.25, 0.5, 0.5, 0.5, 1, 1, 2, 5, 10];

    // Ensure there is a bet for a spin
    if (bet == null || bet <= 0){
        bet = 100
    }

    // Return credits earned
    return (array[Math.floor(Math.random() * array.length)] * bet);
}

// Spin wheel multiple times
function wheelSpinMult(bet, spins) {
    let newBet = 100;

    if (spins > 0){
        newBet = wheelSpin(bet)

        for (i = 1; i < spins; i++){
            newBet = wheelSpin(newBet)
        }
    }

    return newBet
}

const server = app.listen(port, () => {
    console.log("Server running on port %PORT%".replace("%PORT%", port))
});

if (args.debug || args.d) {
    app.get('/app/log/access/', (req, res, next) => {
        const stmt = logdb.prepare("SELECT * FROM accesslog").all();
	    res.status(200).json(stmt);
    })

    app.get('/app/error/', (req, res, next) => {
        throw new Error('Error test works.')
    })
}

// READ (HTTP method GET) at root endpoint /app/
app.get("/app/", (req, res, next) => {
    res.json({"message":"Your API works! (200)"});
	res.status(200);
});

// Endpoint /app/spin/ that returns JSON {"spin":[credits won]} 
// corresponding to the results of the random coin flip.
app.get('/app/spin', (req, res, next) => {
    const spin = wheelSpin()
    if (user_balance == 0) {
        
    }
    const user_balance = user_balance + spin
    res.status(200).json({ "spin" : spin }, { "new balance" : user_balance})
});

// Always log to database
app.use((req, res, next) => {
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referrer: req.headers['referer'],
        useragent: req.headers['user-agent']
    };
    const stmt = logdb.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referrer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referrer, logdata.useragent)
    //console.log(info)
    next();
})

app.post("/app/new/user", (req, res, next) => {
    let data = {
        user: req.body.username,
        pass: req.body.password,
        bal: req.body.bal
    }
    const stmt = userdb.prepare('INSERT INTO userinfo (username, password, balance) VALUES (?, ?, ?)')
    const info = stmt.run(data.user, data.pass, data.bal)
    res.status(200).json(info)
});

// READ a list of users (HTTP method GET) at endpoint /app/users/
app.get("/app/users", (req, res) => {	
    try {
        const stmt = userdb.prepare('SELECT * FROM userinfo').all()
        res.status(200).json(stmt)
    } catch {
        console.error(e)
    }
});

// READ a single user (HTTP method GET) at endpoint /app/user/:id
app.get("/app/user/:id", (req, res) => {
    try {
        const stmt = userdb.prepare('SELECT * FROM userinfo WHERE id = ?').get(req.params.id);
        res.status(200).json(stmt)
    } catch (e) {
        console.error(e)
    }

});

// UPDATE a single user (HTTP method PATCH) at endpoint /app/update/user/:id
app.patch("/app/update/user/:id", (req, res) => {
    let data = {
        user: req.body.username,
        pass: req.body.password,
    }
    const stmt = userdb.prepare('UPDATE userinfo SET username = COALESCE(?,username), password = COALESCE(?,password) WHERE id = ?')
    const info = stmt.run(data.user, data.pass, req.params.id)
    res.status(200).json(info)
});

// UPDATE a single user balance
app.patch("/app/update/user/:id", (req, res) => {
    let data = {
        bal: req.body.bal
    }
    const stmt = userdb.prepare('UPDATE userinfo SET balance = COALESCE(?,bal) WHERE id = ?')
    const info = stmt.run(data.bal, req.params.id)
    res.status(200).json(info)
});

// DELETE a single user (HTTP method DELETE) at endpoint /app/delete/user/:id
app.delete("/app/delete/user/:id", (req, res) => {
    const stmt = userdb.prepare('DELETE FROM userinfo WHERE id = ?')
    const info = stmt.run(req.params.id)
    res.status(200).json(info)
});
// Default response for any other request
app.use(function(req, res){
	res.json({"message":"Endpoint not found. (404)"});
    res.status(404);
});







