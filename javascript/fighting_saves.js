const fs = require('fs');
const _ = require('lodash');

const firebase = require('firebase/app');
require('firebase/firestore');

// const path = './arena.json';
//
// try {
//     if (fs.existsSync(path)){
//         console.log('arena.json is found');
//     } else {
//         throw 'File arena.json is not found, creating new file...';
//     }
// } catch (err) {
//     console.log(err);
//     fs.writeFileSync('arena.json', "{}");
// }

// var readUser = fs.readFileSync('arena.json');
// var userObject = JSON.parse(readUser);

var add_info = async (name, player_health, player_dps, email) => {
    var enemy_health = _.random(player_health - 10, _.round(player_health + 5));
    var enemy_attack_damage = _.random(player_dps - 10, player_dps + 3);
    var player_info = {
            "player_name": name,
            "player_health": player_health,
            "player_dps": player_dps,
            "enemy_health": enemy_health,
            "enemy_dps": enemy_attack_damage
    };

    try {
        var db = firebase.firestore();

        await db.collection('arena').doc(email).set(player_info);

    } catch (err) {
        if (err) {
            console.log('error on function add_info fighting_saves.js')
        } else {
            console.log(err)
        }
    }
    // var result_battle = JSON.stringify(player_info, undefined, 2);
    // fs.writeFileSync('arena.json', result_battle);
};

var get_info = async (email) => {

    try {
        var db = firebase.firestore();

        var battle = await db.collection('arena').doc(email).get();

        return battle.data()

    } catch (err) {
        if (err) {
            console.log(err);
            console.log('error function get_info fighting_saves.js')
        }
    }
    // var get_arena_stats = fs.readFileSync('arena.json');
    // return JSON.parse(get_arena_stats);
};

var battle = async (player_health, enemy_health, player_damage, enemy_damage, email) => {

    var db = firebase.firestore();

    try{
        var battle = await db.collection('arena').doc(email).get();

        var stats = battle.data();

        if ((stats.enemy_health === 0 && stats.player_health > 0) || (stats.player_health === 0 && stats.enemy_health === 0)) {
            return false;
        } else if ((stats.player_health === 0) && (stats.enemy_health > 0)) {
            return true;
        } else {
            var enemy_hp_bar = enemy_health - player_damage;
            if ((enemy_hp_bar) < 0) {
                enemy_hp_bar = 0;
            }

            var player_hp_bar = player_health - enemy_damage;
            if ((player_hp_bar) < 0) {
                player_hp_bar = 0;
            }

            var data = {
                enemy_health: enemy_hp_bar,
                player_health: player_hp_bar
            };

            await db.collection('arena').doc(email).update(data)
        }

    } catch (err) {
        if (err) {
            console.log(err);
            console.log('error function battle in fighting_saves.js')
        } else {
            console.log('error function battle in fighting_saves.js')
        }
    }


    // var get_info = fs.readFileSync('arena.json');
    // var stats = JSON.parse(get_info);
    //
    // if ((stats.enemy_health === 0 && stats.player_health > 0) || (stats.player_health === 0 && stats.enemy_health === 0)) {
    //     return false;
    // } else if ((stats.player_health === 0) && (stats.enemy_health > 0)) {
    //     return true;
    // } else {
    //     var enemy_hp_bar = enemy_health - player_damage;
    //     if ((enemy_hp_bar) < 0) {
    //         enemy_hp_bar = 0;
    //     }
    //
    //     var player_hp_bar = player_health - enemy_damage;
    //     if ((player_hp_bar) < 0) {
    //         player_hp_bar = 0;
    //     }
    //
    //     stats['enemy_health'] = enemy_hp_bar;
    //     stats['player_health'] = player_hp_bar;
    //     var result_battle = JSON.stringify(stats, undefined, 2);
    //     fs.writeFileSync('arena.json', result_battle);
    // }


};

var battleOutcome = async (email) => {

    var db = firebase.firestore();

    try {
        var battle = await db.collection('arena').doc(email).get();

        var stats = battle.data();

        if (stats.enemy_health === 0 && stats.player_health > 0) {
            return true;
        } else if ((stats.player_health === 0 && stats.enemy_health > 0) || (stats.player_health === 0 && stats.enemy_health === 0)) {
            return false;
        }

    } catch (err) {
        console.log('function battleOutcome error, fighting_saves.js');
        console.log(err)
    }

    // var get_arena_stats = fs.readFileSync('arena.json');
    // var stats = JSON.parse(get_arena_stats);
    //
    // if (stats.enemy_health === 0 && stats.player_health > 0) {
    //     return true;
    // } else if ((stats.player_health === 0 && stats.enemy_health > 0) || (stats.player_health === 0 && stats.enemy_health === 0)) {
    //     return false;
    // }
};

module.exports = {
    add_info: add_info,
    get_info: get_info,
    battle: battle,
    battleOutcome: battleOutcome
};