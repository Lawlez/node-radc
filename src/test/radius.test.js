/**
 * Module dependencies
 */

var path = require('path')

var radclient = require('../client')
var radserver = require('../serverMock')

var noop = function () {}
var radport = 60000

function random(begin, end) {
    return Math.floor(Math.random() * (end - begin + 1) + begin)
}

var packet = {
    code: 'Access-Request',
    secret: 's€cre3t',
    identifier: random(0, 255),
    attributes: [
        ['NAS-IP-Address', '192.168.10.39'],
        ['User-Name', 'utente'],
        ['User-Password', 'uccellone231']
    ]
}

describe('radclient', function () {
    beforeAll(function (done) {
        radserver.bind(60000, '127.0.0.1', done)
    })

    afterAll(function (done) {
        radserver.close(done)
    })

    it('Should throw if `host` option is missing', function () {
        var exception

        try {
            radclient(packet, {})
        } catch (e) {
            exception = e
        }

        expect(exception.message).toBe('option `host` must be a string')
    })

    it('Should throw if `callback` option is missing', function () {
        var exception

        try {
            radclient(packet, { host: '192.168.100.102' })
        } catch (e) {
            exception = e
        }

        expect(exception.message).toBe('option `callback` must be a function')
    })

    it('Should throw if `retries` option is not a number', function () {
        var exception

        try {
            var options = {
                host: '192.168.100.102',
                retries: 'test'
            }

            radclient(packet, options, noop)
        } catch (e) {
            exception = e
        }

        expect(exception.message).toBe('option `retries` must be a number')
    })

    it('Should throw if `timeout` option is not a number', function () {
        var exception

        try {
            var options = {
                host: '192.168.100.102',
                timeout: 'test'
            }

            radclient(packet, options, noop)
        } catch (e) {
            exception = e
        }

        expect(exception.message).toBe('option `timeout` must be a number')
    })

    // TODO fix this test, it seems to work(triesw 3 times then fails) but it doesnt work as defined here.
    it.skip('Should retry specified times if an error is encountered', function (done) {
        var options = {
            host: '0.0.0.0',
            retries: 3,
            timeout: 1000,
            dictionaries: path.join(__dirname, '../dictionaries')
        }

        radclient(packet, options, function (err, res) {
            expect(err.message).toBe('Maximum retries exceeded')
            done()
        })
    })

    it('Should callback with error if packet is incorrect', function (done) {
        var options = {
            host: '192.168.100.102',
            retries: 3,
            timeout: 1000,
            dictionaries: path.join(__dirname, '../dictionaries')
        }

        radclient({ packet: 'invalid' }, options, function (err, res) {
            expect(err).toBeTruthy()
            expect(!res).toBe(true)
            done()
        })
    })

    it('Should send a packet correctly', function (done) {
        var options = {
            host: '127.0.0.1',
            port: radport,
            retries: 3,
            timeout: 1000,
            dictionaries: path.join(__dirname, '../dictionaries')
        }

        radclient(packet, options, function (err, res) {
            expect(res.code).toBe('Access-Accept')
            expect(res.attributes['Vendor-Specific']['WISPr-Location-ID']).toBe(
                'Test'
            )
            done()
        })
    })
})
