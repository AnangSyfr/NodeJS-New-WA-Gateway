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
const db = require("./db_config");


app.get('/', (req, res) => {
    // res.status(200).json({
    //     status:true,
    //     message:'Not Just Hello World'
    // }); ini buat testing
    res.sendFile('read.html', { root: __dirname });
});



    io.on('connection', function (socket) {
        socket.emit('message', "Connecting ....");
    
        db.connect(function(err) {
            if (err) throw err;
            
            let sql = "SELECT * FROM barang";
            db.query(sql, function (err, result) {
                if (err) throw err;
                var input = '';
                result.forEach(element => {
                    input += "<li>"+element.kode+"</li>";
                });
                socket.emit('message',input);
                console.log(result);
            });
        });
    });




server.listen(8000, function () {
    console.log("App running at port 8000");
});