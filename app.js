const { Client, LegacySessionAuth, LocalAuth } = require('whatsapp-web.js');

const express = require('express');
const qrcode = require('qrcode');
const socketIO = require('socket.io');
const http = require('http');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const SESSION_FILE_PATH = './auth-session.json';
let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

app.get('/', (req, res) => {
    // res.status(200).json({
    //     status:true,
    //     message:'Not Just Hello World'
    // }); ini buat testing
    res.sendFile('index.html', { root: __dirname });
});

const client = new Client({
    puppeteer: { headless: true }, 
    //for legacy
    // authStrategy: new LegacySessionAuth({
    //     session: sessionData
    // })
    // for localauth
    authStrategy: new LocalAuth({clientId:"client-one"})
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', (err) => {
    console.log(err);
});


// client.on('message', msg => {
//     if (msg.body == 'ping') {
//         msg.reply('pong');
//     } else {
//         msg.reply('Ya Ndak Tau Kok Tanya Saya');
//     }
// });


client.initialize();

//Socket IO
io.on('connection', function (socket) {
    socket.emit('message', "Connecting ....");

    client.on('qr', (qr) => {
        // Generate and scan this code with your phone
        console.log('QR RECEIVED', qr);
        qrcode.toDataURL(qr, (err, url) => {
            socket.emit('qr', url);
            socket.emit('message', 'QR Code Reveived, please scan');
        });
    });

    client.on('ready', () => {
        socket.emit('message', 'WhatsApp is ready!');
    });
});

client.on('change_state', state => {
    console.log('CHANGE STATE', state );
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

//send message
app.post('/send-message', (req, res) => {
    const number = req.body.number;
    const message = req.body.message;

    client.sendMessage(number, message).then(response => {
        res.status(200).json({
            status: true,
            response: response
        })
    }).catch(err => {
        res.status(500).json({
            status: false,
            response: err
        })
    });
});


 
// Getting Request
app.get('/', (req, res) => {
 
    // Sending the response
    res.send('Hello World!')
    
    // Ending the response
    res.end()
})
 
// Establishing the port
const PORT = process.env.PORT || 8000;
server.listen(PORT, function () {
    console.log(`App running at port ${PORT}`);
});