"use strict";
const Docker = require('dockerode');

const docker = new Docker();
let io;
let nsps = {};

exports.init = http => {
    io = require('socket.io').listen(http);
};

exports.run = async (imageName, env = []) => {
    console.log(imageName)
    let opt = {
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        OpenStdin: true,
        StdinOnce: true,
        // Env: env,
        Cmd: ['/bin/sh'],
        Image: imageName,
        Volumes: {},
        Binds: []
    };
    // opt.Volumes[MountPath] = {};
    const container = await docker.createContainer(opt);
    const stream = await container.attach({
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true
    });
    nsps[container.id] = io.of(`/${container.id}`);
    nsps[container.id].on('connect', event => {
        console.log(`run:${container.id}`);
        stream.on('data', d => {
            if (nsps[container.id]) nsps[container.id].emit('data', d.toString());
        });
        event.on('data', d => {
            stream.write(d);
        });
        event.on('disconnect', () => {
            container.remove({ force: true }, function (err, data) {
                console.log(`remove:${container.id}`);
                if (err) console.error(err);
                delete nsps[container.id];
            });
        });

        container.start();
    });
    return container;
};

// setInterval(() => {
//     docker.listContainers((err, containers) => {
//         if (err) return false;
//         // 稼働時間チェック        
//         let unixtime = new Date().getTime() / 1000;
//         containers = containers.filter((element, index, array) => {
//             for (let lang in config.build.langs) {
//                 if (element.Image === config.build.langs[lang].docker && unixtime - element.Created > config.build.timeout) {
//                     return true;
//                 }
//             }
//         });
//         // 殺す
//         // console.log(containers);
//         containers.forEach((containerInfo) => {
//             docker.getContainer(containerInfo.Id).stop(() => {
//                 // console.log(`kill:${containerInfo.Id}`);
//             });
//         });
//     });
// }, 10000);