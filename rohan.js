// Require minimist module (make sure you install this one via npm).
// Require minimist module
const args = require('minimist')(process.argv.slice(2))
// See what is stored in the object produced by minimist
//console.log('Command line arguments: ', args)

// Store help text 
const help = (`
server.js [options]
--port, -p	Set the port number for the server to listen on. Port number must be an integer
            between 1 and 65535.
--debug, -d If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true where 
            logs are always written to database.
--help, -h	Return this message and exit.
`)
// If --help, echo help text and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

// Define app using express
var express = require('express')
var app = express()

// Allow json body messages
app.use(express.json());

// Require fs
const fs = require('fs')

// Require morgan
const morgan = require('morgan')

// Require database SCRIPT file
const logdb = require('./src/services/database.js')

// Server port
const port = args.port || args.p || process.env.PORT || 5000
// If --log=false then do not create a log file
if (args.log == 'false') {
    console.log("NOTICE: not creating file access.log")
} else {
// Use morgan for logging to files
    const logdir = './log/';

    if (!fs.existsSync(logdir)){
        fs.mkdirSync(logdir);
    }
// Create a write stream to append to an access.log file
    const accessLog = fs.createWriteStream( logdir+'access.log', { flags: 'a' })
// Set up the access logging middleware
    app.use(morgan('combined', { stream: accessLog }))
}

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

// Spin the wheel once with a user bet
function wheelSpin(bet, user_balance) {
    // All multiples on the wheel
    let array = [0.25, 0.25, 0.5, 0.5, 0.5, 1, 1, 2, 5, 10];

    // Ensure there is a bet for a spin
    if (bet == null || bet <= 0){
        if (bet > user_balance){
            bet = user_balance;
        } else {
            bet = 100
        }
    }

    // Return credits earned
    return (array[Math.floor(Math.random() * array.length)] * bet);
}

// Spin wheel multiple times
function wheelSpinMult(bet, spins, user_balance) {
    let newBet = 100;

    if (spins > 0){
        newBet = wheelSpin(bet)

        for (i = 1; i < spins; i++){
            newBet = wheelSpin(newBet)
        }
    }

    return newBet
}

// Serve static HTML public directory
app.use(express.static('./public'))

// READ (HTTP method GET) at root endpoint /app/
app.get("/app/", (req, res, next) => {
    res.json({"message":"Your API works! (200)"});
	res.status(200);
});

// Endpoint /app/spin/ that returns JSON {"spin":[credits won]} 
// corresponding to the results of the random coin flip.
app.get('/app/spin/', (req, res) => {
    const win = wheelSpin()
    res.status(200).json({ "spin" : win })
});

app.post('/app/flip/coins/', (req, res, next) => {
    const flips = coinFlips(req.body.number)
    const count = countFlips(flips)
    res.status(200).json({"raw":flips,"summary":count})
})

app.get('/app/flips/:number', (req, res, next) => {
    const flips = coinFlips(req.params.number)
    const count = countFlips(flips)
    res.status(200).json({"raw":flips,"summary":count})
});

app.post('/app/flip/call/', (req, res, next) => {
    const game = flipACoin(req.body.guess)
    res.status(200).json(game)
})

app.get('/app/flip/call/:guess(heads|tails)/', (req, res, next) => {
    const game = flipACoin(req.params.guess)
    res.status(200).json(game)
})

if (args.debug || args.d) {
    app.get('/app/log/access/', (req, res, next) => {
        const stmt = logdb.prepare("SELECT * FROM accesslog").all();
	    res.status(200).json(stmt);
    })

    app.get('/app/error/', (req, res, next) => {
        throw new Error('Error test works.')
    })
}

// Default API endpoint that returns 404 Not found for any endpoints that are not defined.
app.use(function(req, res){
    const statusCode = 404
    const statusMessage = 'NOT FOUND'
    res.status(statusCode).end(statusCode+ ' ' +statusMessage)
});

// Start server
const server = app.listen(port, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",port))
});

// Tell STDOUT that the server is stopped
process.on('SIGINT', () => {
    server.close(() => {
		console.log('\nApp stopped.');
	});
});