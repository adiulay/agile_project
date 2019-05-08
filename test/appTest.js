const request = require('supertest');
const assert = require('chai').assert;
var cheerio = require('cheerio');
var should = require('chai').should();
const chai = require('chai'), chaiHttp = require('chai-http');
chai.use(require('chai-http'));
const expect = require('chai').expect;

const app = require('../app.js');
const user_db = require('../javascript/user_db.js');

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
                expect(response).to.have.status(200);
                var $ = cheerio.load(response.text);
                var output = $('form > div > p').text();
                assert.equal(output, 'Password incorrect');
            })
            .catch((err)=> {
                console.log(err)
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
                agent
                    .get('/character')
                    .then(async (response) => {
                        // console.log(response.text);

                        var $ = cheerio.load(response.text);
                        var display = $('div > ul > li > p').text();
                        assert.equal(display, 'CREATE CHARACTER NOWCREATE CHARACTER NOWCREATE CHARACTER NOW');
                        done()
                    })
        })
    });

    it('Should get characters health', (done) => {
        var agent = chai.request.agent(app);
            agent
                .post('/user_logging_in')
                .send({
                    email: 'test_create_character@gmail.com',
                    password: 'test_create_character'
                })
                .then((response) => {
                    return agent.get('/character')
                        .then((response) => {
                            // console.log(response.text)
                            var pattern = /31/;
                            var result = pattern.test(response.text);
                            assert.equal(result, true);
                            done()
                        })
                        .catch((err) => {
                            console.log('ERROR MY DUDE ERROR');
                            console.log(err);
                            console.log('ERROR MY DUDE ERROR');
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
                        var string = response.text;
                        var pattern = /Create your character to view your wins and losses/;
                        var result = pattern.test(string);
                        assert.equal(result, true);
                        done()
                    })
            })
            .catch((err) => {
                if (err) {
                    console.log(err);
                }
            })
    })
});

describe('POST /insert', () => {
    var agent = chai.request(app);
    it('should successfully sign up an account', (done) => {
        var email_account = 'test_email@gmail.com';
        agent
            .post('/insert')
            .send({
                first_name: 'Jack',
                last_name: 'Dawson',
                email: email_account,
                password: 'jackdawson123',
                password_repeat: 'jackdawson123'
            })
            .then((response) => {
                // console.log(response.text);
                var string = response.text;
                var pattern = /Account created!/;
                var result = pattern.test(string);
                assert.equal(result, true);

                user_db.delete_account(email_account)
                    .then((response) => {
                        console.log('account deleted')
                    })
                    .catch( (err) => {
                        console.log('Error', err)
                    });

                done()
            })
            .catch((err) => {
                console.log('/////////////////////////////////////');
                console.log(err);
                console.log('/////////////////////////////////////')
            });
    });

    it('fail to signup due to incorrect password match', (done) => {
        var agent = chai.request(app);
        var email_account = 'test_email@gmail.com';
        agent
            .post('/insert')
            .send({
                first_name: 'Jack',
                last_name: 'Dawson',
                email: email_account,
                password: 'jackdawson123',
                password_repeat: 'jackdawson321'
            })
            .then((response) => {
                // console.log(response.text);
                var string = response.text;
                var pattern = /Password does not match./;
                var result = pattern.test(string);
                assert.equal(result, true);
                done()
            })
            .catch((err) => {
                console.log('/////////////////////////////////////');
                console.log(err);
                console.log('/////////////////////////////////////')
            });
    });
})

describe('GET /index_b', () => {
    var agent = chai.request(app);
    it('Should redirect to home page if not logged in', (done) => {
        agent
            .get('/index_b')
            .then((response) => {
                // console.log(response.text);
                var $ = cheerio.load(response.text);
                var title = $('title').text();
                assert.equal(title, 'Official Front Page');
                done();
            })
            .catch((err) => {
                if (err) {
                    console.log('errorerrorerrorerrorerrorerror');
                    console.log(err);
                    console.log('errorerrorerrorerrorerrorerror')
                }
            })
    });

    it('Successful login to accounts home page', (done) => {
        chai.request.agent(app)
            .post('/user_logging_in')
            .send({
                email: 'asdf@gmail.com',
                password: 'asdfasdf'
            })
            .then((response) => {
                var string = response.text;
                var pattern = /Welcome jimmy/;
                var result = pattern.test(string);
                assert.equal(result, true);
                done()
            })
            .catch ((err) => {
                if (err) {
                    console.log('errorerrorerrorerrorerrorerror');
                    console.log(err);
                    console.log('errorerrorerrorerrorerrorerror')
                }
            })
    })
});
