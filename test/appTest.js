const request = require('supertest');
const assert = require('chai').assert;
var cheerio = require('cheerio');
var should = require('chai').should();
const chai = require('chai'), chaiHttp = require('chai-http');
chai.use(require('chai-http'));
const expect = require('chai').expect;

const app = require('../app.js');

describe('GET /', () => {
    it("should return webpage with title of 'Official Front Page' ", (done) => {
        request(app)
            .get('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', "text/html; charset=utf-8")
            .expect(200)
            .end(function(err, res) {
                // console.log(res.text);
                var $ = cheerio.load(res.text);
                var title = $('title').text();
                assert.equal(title, 'Official Front Page');
                done()
            })
    });
});

describe('POST /user_logging_in', () => {
    it('should output wrong password', async () => {
        return chai.request(app)
            .post('/user_logging_in')
            .send({
                email: 'asdf@gmail.com',
                password: 'hi'
            })
            .then((response) => {
                // console.log(response);
                // console.log(response)
                var $ = cheerio.load(response.text);
                var output = $('form > div > p').text();
                assert.equal(output, 'Password incorrect');
            })
    });

    it('should output account not found', async () => {
        return chai.request(app)
            .post('/user_logging_in')
            .send({
                email: 'asdf@gmail.coms',
                password: 'hi'
            })
            .then((response) => {
                var $ = cheerio.load(response.text);
                var output = $('form > div > p').text();
                assert.equal(output, 'Email is not found');
            })
    })
});

describe('GET /character', () => {
    var agent = chai.request.agent(app);
    it('should show characters info', (done) => {
        agent
            .post('/user_logging_in')
            .send({
                email: 'asdf@gmail.com',
                password: 'asdfasdf'
            })
            .then((response) => {
                return agent.get('/character')
                    .then(async (response) => {
                        // console.log(response.text);

                        var $ = cheerio.load(response.text);
                        var display = $('div > ul > li > p').text();
                        assert.equal(display, 'CREATE CHARACTER NOWCREATE CHARACTER NOWCREATE CHARACTER NOW');
                        done()
                    })
        })
    })
});

describe('GET /account', () => {
    var agent = chai.request.agent(app);
    it('should show account info', (done) => {
        agent
            .post('/user_logging_in')
            .send({
                email: 'asdf@gmail.com',
                password: 'asdfasdf'
            })
            .then((response) => {
                return agent.get('/account')
                    .then(async (response) => {
                        // console.log(response.text)
                        // var $ = cheerio.load(response.text);
                        // var display = $('Create your character to view your wins and losses').text();

                        var string = response.text;
                        var pattern = /Create your character to view your wins and losses/;
                        var result = pattern.test(string);
                        assert.equal(result, true);

                        // assert.equal(display, 'hi');
                        done()
                    })
            })
            .catch((err) => {
                if (err) {
                    console.log('/////////////////////////////////////');
                    console.log(err);
                    console.log('/////////////////////////////////////')
                }
            })
    })
});
