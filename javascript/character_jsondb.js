const fs = require('fs');
const _ = require('lodash');

const path = './character_database.json';

const md5 = require('./MD5');

try{
    if (fs.existsSync(path)){
        console.log('character_database.json is found');
    } else {
        throw 'File character_database.json is not found, creating new file...'
    }
} catch(err) {
    console.log(err);
    fs.writeFileSync('character_database.json', "{}");
}

var readUser = fs.readFileSync("character_database.json");
var userObject = JSON.parse(readUser);

var createCharacter = (email, character_name) => {
    if (email in userObject) {
        return 'Email is already taken';
    } else {
        var health = _.random(1, 100);
        userObject[email] = {
            email: email,
            character_name: character_name,
            character_health: health,
            character_attack_damage: _.round(health/3),
            win: 0,
            lost: 0
        };
        var result_character_account = JSON.stringify(userObject, undefined, 2);
        fs.writeFileSync('character_database.json', result_character_account);
    }
};

var deleteCharacter = (email) => {
    if (email in userObject) {
        delete userObject[email];
        var result_character_account = JSON.stringify(userObject, undefined, 2);
        fs.writeFileSync('character_database.json', result_character_account);
    }
};

var getDetails = (email) => {
    if (email in userObject) {
        return userObject[email]
    } else {
        return false
    }
};

var updateName = (email, new_name) => {
    if (email in userObject) {
        userObject[email].character_name = new_name;
        var result_character_account = JSON.stringify(userObject, undefined, 2);
        fs.writeFileSync('character_database.json', result_character_account);
    } else {
        return "Error, email not found"
    }
};

var authenticate = (email) => {
    return email in userObject;
};

var updateWin = (email) => {
    if (email in userObject) {
        userObject[email].win += 1;
        userObject[email].character_health += 10;
        userObject[email].character_attack_damage += 5;

        var result_character_account = JSON.stringify(userObject, undefined, 2);
        fs.writeFileSync('character_database.json', result_character_account);
    } else {
        console.log('error updating win, email not found')
    }
};

var updateLost = (email) => {
    if (email in userObject) {
        userObject[email].lost += 1;

        var result_character_account = JSON.stringify(userObject, undefined, 2);
        fs.writeFileSync('character_database.json', result_character_account);
    } else {
        console.log('error updating lost, email not found')
    }
};

module.exports = {
    authenticate: authenticate,
    createCharacter: createCharacter,
    getDetails: getDetails,
    deleteCharacter: deleteCharacter,
    updateName: updateName,
    updateWin: updateWin,
    updateLost: updateLost
};