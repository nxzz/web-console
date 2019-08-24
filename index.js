"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const build = require('./exec');

const app = express();
const http = require('http').Server(app);
build.init(http);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/public'));

app.post('/api/console/:imagename', async function (req, res) {
    try {
        const container = await build.run(req.params.imagename);
        res.send({
            containerId: container.id
        });
    } catch (error) {
        console.error(error);
    }
});


http.listen(3000, function () {
    console.log('listening on *:3000');
});