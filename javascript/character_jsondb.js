const fs = require('fs');
const _ = require('lodash');

const firebase = require('firebase/app');
require('firebase/firestore');

// const path = './character_database.json';
//
// try{
//     if (fs.existsSync(path)){
//         console.log('character_database.json is found');
//     } else {
//         throw 'File character_database.json is not found, creating new file...'
//     }
// } catch(err) {
//     console.log(err);
//     fs.writeFileSync('character_database.json', "{}");
// }

// var readUser = fs.readFileSync("character_database.json");
// var userObject = JSON.parse(readUser);

var createCharacter = async (email, character_name) => {

    try {
        var db = firebase.firestore();

        var health = _.random(1, 100);

        var data = {
            email: email,
            character_name: character_name,
            character_health: health,
            character_attack_damage: _.round(health/3),
            win: 0,
            lost: 0
        };
        //checks for email if exist
        var check_email_exist = await db.collection('characters').doc(email).get();

        if (check_email_exist.data().email === email) {
            return 'Email is already taken.'
        } else {
            db.collection('characters').doc(email).set(data);
            return 'Account created!'
        }
    } catch (err) {
        if (err) {
            db.collection('characters').doc(email).set(data);
            return 'Character created!'
        } else {
            console.log('Error on register.js function addData');
        }
    }

    // if (email in userObject) {
    //     return 'Email is already taken';
    // } else {
    //     var health = _.random(1, 100);
    //     userObject[email] = {
    //         email: email,
    //         character_name: character_name,
    //         character_health: health,
    //         character_attack_damage: _.round(health/3),
    //         win: 0,
    //         lost: 0
    //     };
    //     var result_character_account = JSON.stringify(userObject, undefined, 2);
    //     fs.writeFileSync('character_database.json', result_character_account);
    // }
};

var deleteCharacter = async (email) => {

    var db = firebase.firestore();
    try {
        var accounts = await db.collection('characters').doc(email).get();

        if (accounts.data().email === email) {
            //deletes the account
            db.collection('characters').doc(email).delete();
            // return 'Account Deleted.'
        } else {
            return 'Account not found in database.'
        }
    } catch (err) {
        if (err) {
            return 'Account not found in Database'
        } else {
            console.log('Error in register.js function deleteData')
        }
    }

    // if (email in userObject) {
    //     delete userObject[email];
    //     var result_character_account = JSON.stringify(userObject, undefined, 2);
    //     fs.writeFileSync('character_database.json', result_character_account);
    // }
};

var getDetails = async (email) => {

    var db = firebase.firestore();
    try{
        var characters = await db.collection('characters').doc(email).get();

        if (characters.data().email === email) {
            return {
                email: characters.data().email,
                character_name: characters.data().character_name,
                character_health: characters.data().character_health,
                character_attack_damage: characters.data().character_attack_damage,
                win: characters.data().win,
                lost: characters.data().lost
            }
        } else {
            return false
            // var Email = accounts.data().email;
            // var Password = accounts.data().password;
            // var Username = accounts.data().username;
        }

        // return [
        //     Email,
        //     Password,
        //     Username
        // ]
    } catch (err) {
        if (err) {
            return false
            // return 'Account not found in Database'
        } else {
            console.log(err);
            console.log('There is an error in register.js function showData');
        }
    }

    // if (email in userObject) {
    //     return userObject[email]
    // } else {
    //     return false
    // }
};

var updateName = async (email, new_name) => {

    var db = firebase.firestore();

    try {
        var characters = await db.collection('characters').doc(email).get();

        if (characters.data().email === email) {
            var data = {
                character_name: new_name,
            };

            await db.collection('characters').doc(email).update(data);
        } else {
            console.log('error on function updateName');
        }
    } catch (err) {
        if (err) {
            return false
        }
        console.log(err);
        console.log('error on function updateName')
    }

    // if (email in userObject) {
    //     userObject[email].character_name = new_name;
    //     var result_character_account = JSON.stringify(userObject, undefined, 2);
    //     fs.writeFileSync('character_database.json', result_character_account);
    // } else {
    //     return "Error, email not found"
    // }
};

var authenticate = async (email) => {

    var db = firebase.firestore();
    try{
        var characters = await db.collection('characters').doc(email).get();

        return characters.data().email === email;
    } catch (err) {
        if (err) {
            return false
        } else {
            console.log(err);
            console.log('Error function from character_jsondb.js function authenticate');
        }
    }
    // return email in userObject;
};

var updateWin = async (email) => {

    var db = firebase.firestore();

    try {
        var characters = await db.collection('characters').doc(email).get();

        if (characters.data().email === email) {
            var data = {
                character_attack_damage: characters.data().character_attack_damage + 5,
                character_health: characters.data().character_health + 10,
                win: characters.data().win + 1
            };

            await db.collection('characters').doc(email).update(data);
        } else {
            console.log('error on function updateWin');
        }
    } catch (err) {
        console.log(err);
        console.log('error on function updateWin')
    }

    // if (email in userObject) {
    //     userObject[email].win += 1;
    //     userObject[email].character_health += 10;
    //     userObject[email].character_attack_damage += 5;
    //
    //     var result_character_account = JSON.stringify(userObject, undefined, 2);
    //     fs.writeFileSync('character_database.json', result_character_account);
    // } else {
    //     console.log('error updating win, email not found')
    // }
};

var updateLost = async (email) => {

    var db = firebase.firestore();

    try {
        var characters = await db.collection('characters').doc(email).get();

        if (characters.data().email === email) {
            var data = {
                lost: characters.data().lost + 1
            };

            await db.collection('characters').doc(email).update(data);
        } else {
            console.log('error on function updateLost');
        }
    } catch (err) {
        console.log(err);
        console.log('error on function updateLost')
    }

    // if (email in userObject) {
    //     userObject[email].lost += 1;
    //
    //     var result_character_account = JSON.stringify(userObject, undefined, 2);
    //     fs.writeFileSync('character_database.json', result_character_account);
    // } else {
    //     console.log('error updating lost, email not found')
    // }
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