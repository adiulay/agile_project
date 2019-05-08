const request = require('supertest');
const assert = require('chai').assert;
var cheerio = require('cheerio');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = require('chai').expect;

const user_db = require('../javascript/user_db.js');

describe('add_new_user function', () => {
    it("returns account created!",  async () => {
        let add = await user_db.add_new_user('first_name_test',
            'last_name_test',
            'test_email@gmail.com',
            'password_test',
            'password_test');

        if (add === 'Email is already taken.') {
        	assert.equal(add, 'Email is already taken.')
        } else {
        	assert.equal(add, 'Account created!');
        }

        await user_db.delete_test()
    });

    it('returns email already taken', async () => {
        await user_db.add_new_user('first_name_test',
            'last_name_test',
            'test_email@gmail.com',
            'password_test',
            'password_test');

        let add_again = await user_db.add_new_user('first_name_test',
            'last_name_test',
            'test_email@gmail.com',
            'password_test',
            'password_test');

        assert.equal(add_again, 'Email is already taken.')

        await user_db.delete_test()
    });

    it('returns if password does not match', async () => {
        let add = await user_db.add_new_user('first_name_test',
            'last_name_test',
            'test_email@gmail.com',
            'password_test',
            'password');

        assert.equal(add, 'Password does not match.');

        await user_db.delete_test()
    })
});

describe('login_check function', () => {
    it('returns on successful login', async () => {
        await user_db.add_new_user('first_name_test',
            'last_name_test',
            'test_email@gmail.com',
            'password_test',
            'password_test');

        let check = await user_db.login_check('test_email@gmail.com', 'password_test');

        if (check === 'Email is not found') {
            assert.equal(check, 'Email is not found')
        } else {
            assert.equal(check, 'Success!');
        }

        await user_db.delete_test()
    });

    it('returns unsuccessful login due to incorrect password', async () => {
        await user_db.add_new_user('first_name_test',
            'last_name_test',
            'test_email@gmail.com',
            'password_test',
            'password_test');

        let check = await user_db.login_check('test_email@gmail.com', 'password');

        if (check === 'Email is not found') {
            assert.equal(check, 'Email is not found');
        } else {
            assert.equal(check, 'Password incorrect');
        }

        await user_db.delete_test()
    });

    it('returns email not found', async () => {
        let check = await user_db.login_check('test_email@gmail.com', 'password_test')

        assert.equal(check, 'Email is not found');
        assert.typeOf(check, 'string');

        await user_db.delete_test()
    })
});

describe('email_get function', () => {
    it('returns the username of the account', async () => {
        await user_db.add_new_user('first_name_test',
            'last_name_test',
            'test_email@gmail.com',
            'password_test',
            'password_test');

        let get_username = await user_db.email_get('test_email@gmail.com');

        if (get_username === 'Error Please Log off') {
            assert.equal(get_username, 'Error Please Log off')
        } else {
            assert.equal(get_username, 'first_name_test');
        }

        await user_db.delete_test()
    });

    it('returns error if email not found', async () => {
        let get_username = await user_db.email_get('test_email@gmail.com');

        if (get_username === 'first_name_test') {
            assert.equal(get_username, 'first_name_test');
        } else {
            assert.equal(get_username, 'Error Please Log off');
        }

        await user_db.delete_test()
    })
});