const fs = require('fs');
const _ = require('lodash');
const passwordHash = require('password-hash');

const firebase = require('firebase/app');
require('firebase/firestore');
firebase.initializeApp({
    apiKey: "AIzaSyCT-ig3IbJNgfDjoPqrOjjfrXj-pFkRuj0",
    authDomain: "acit2911-project.firebaseapp.com",
    databaseURL: "https://acit2911-project.firebaseio.com",
    projectId: "acit2911-project",
    storageBucket: "acit2911-project.appspot.com",
    messagingSenderId: "290770888287"
});

// const path = './user_database.json';

// try{
//     if (fs.existsSync(path)){
//         console.log('user_database.json is found');
//     } else {
//         throw 'File user_database.json is not found, creating new file...'
//     }
// } catch(err) {
//     console.log(err);
//     fs.writeFileSync('user_database.json', "{}");
// }

// var readUser = fs.readFileSync("user_database.json");
// var userObject = JSON.parse(readUser);

var add_new_user = async (first_name, last_name, email, password, re_password) => {

    if (password !== re_password) {
        //checks password whenever necessary
        return 'Password does not match.'
    } else {
        try {
            var db = firebase.firestore();

            var data = {
                email: email,
                password: passwordHash.generate(password),
                username: first_name,
                last_name: last_name
            };
            //checks for email if exist
            var check_email_exist = await db.collection('accounts').doc(email).get();

            if (check_email_exist.data().email === email) {
                return 'Email is already taken.'
            } else {
                db.collection('accounts').doc(email).set(data);
                return 'Account created!'
            }
        } catch (err) {
            if (err) {
                db.collection('accounts').doc(email).set(data);
                return 'Account created!'
            } else {
                console.log('Error on register.js function addData');
            }
        }
    }

    // if (email in userObject) {
    //     return 'Email has already been taken.'
    // }
    //
    // if (password !== password_repeat) {
    //     return 'Password does not match'
    // } else {
    //     userObject[email] = {
    //         First_Name: first_name,
    //         Last_Name: last_name,
    //         Email_Address: email,
    //         Password: passwordHash.generate(password)
    //     };
    //     var result_user_account = JSON.stringify(userObject, undefined, 2);
    //     fs.writeFileSync('user_database.json', result_user_account);
    //
    //     return 'Your account is created!'
    // }
};

var login_check = async (email, password) => {
    var db = firebase.firestore();
    try {
        var check_email_exist = await db.collection('accounts').doc(email).get();

        if (check_email_exist.data().email === email) {
            if (passwordHash.verify(password, check_email_exist.data().password) === true) {
                return 'Success!'
            } else {
                return 'Password incorrect'
            }
        } else {
            return 'Email is not found'
        }
    } catch (err) {
        if (err) {
            return 'Email is not found'
        } else {
            console.log(err);
        }
    }

    // console.log(typeof userObject.Password);

    // if (email in userObject) {
    //     if (passwordHash.verify(password, userObject[`${email}`].Password) === true) {
    //         return 'Success!'
    //     } else {
    //         return 'Password incorrect'
    //     }
    // } else {
    //     return 'Email is not found'
    // }
};

var email_get = async (email) => {
    var db = firebase.firestore();

    try {
        var check_email_exist = await db.collection('accounts').doc(email).get();

        if (check_email_exist.data().email === email) {
            return check_email_exist.data().username
        }
    } catch (err) {
        if (err) {
            return 'Error Please Log off'
        } else {
            console.log(err)
        }
    }

    // if (email in userObject) {
    //     return userObject[`${email}`].First_Name
    // }
};

var delete_test = async () => {
    var db = firebase.firestore();
 try {
     await db.collection("accounts").doc("test_email@gmail.com").delete()
 } catch (err) {
     console.log('Testing phase error code')
 }
};

module.exports = {
    add_new_user: add_new_user,
    login_check: login_check,
    email_get: email_get,
    delete_test
};