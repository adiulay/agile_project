const fs = require('fs');
const _ = require('lodash');

const path = './arena.json';

try {
    if (fs.existsSync(path)){
        console.log('arena.json is found');
    } else {
        throw 'File arena.json is not found, creating new file...';
    }
} catch (err) {
    console.log(err);
    fs.writeFileSync('arena.json', "{}");
}

// var readUser = fs.readFileSync('arena.json');
// var userObject = JSON.parse(readUser);

var add_info = function (name, player_health, player_dps) {
    var enemy_health = _.random(player_health - 10, _.round(player_health + 5));
    var enemy_attack_damage = _.random(player_dps - 10, player_dps + 3);
    var player_info = {
            "player_name": name,
            "player_health": player_health,
            "player_dps": player_dps,
            "enemy_health": enemy_health,
            "enemy_dps": enemy_attack_damage
    };
    var result_battle = JSON.stringify(player_info, undefined, 2);
    fs.writeFileSync('arena.json', result_battle);
};

var get_info = function () {
    var get_arena_stats = fs.readFileSync('arena.json');
    return JSON.parse(get_arena_stats);
};

var battle = function (player_health, enemy_health, player_damage, enemy_damage) {
    var get_info = fs.readFileSync('arena.json');
    var stats = JSON.parse(get_info);

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

        stats['enemy_health'] = enemy_hp_bar;
        stats['player_health'] = player_hp_bar;
        var result_battle = JSON.stringify(stats, undefined, 2);
        fs.writeFileSync('arena.json', result_battle);
    }


};

var battleOutcome = function() {
    var get_arena_stats = fs.readFileSync('arena.json');
    var stats = JSON.parse(get_arena_stats);

    if (stats.enemy_health === 0 && stats.player_health > 0) {
        return true;
    } else if ((stats.player_health === 0 && stats.enemy_health > 0) || (stats.player_health === 0 && stats.enemy_health === 0)) {
        return false;
    }
};

module.exports = {
    add_info: add_info,
    get_info: get_info,
    battle: battle,
    battleOutcome: battleOutcome
};