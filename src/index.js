
const radserver = require('./serverMock')

const radport = 60000

function random(begin, end) {
    return Math.floor(Math.random() * (end - begin + 1) + begin)
}

const packet = {
    code: 'Access-Request',
    secret: 's€cre3t',
    identifier: random(0, 255),
    attributes: [
        ['NAS-IP-Address', '192.168.10.39'],
        ['User-Name', 'utente'],
        ['User-Password', 'uccellone231']
    ]
}
const isDone = () => console.log('done')

const startServer = (port) =>  radserver.bind(port, '127.0.0.1',isDone)
const stopServer = () => radserver.close(isDone)
        

startServer(radport)