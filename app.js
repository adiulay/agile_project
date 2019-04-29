const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const session = require('express-session');
const axios = require('axios');
const _ = require('lodash');
const fs = require('fs');

const {
    PORT = 8080,
    SESS_LIFETIME = 1000 * 60 * 60 * 2,
    SESS_NAME = 'sid',
    SESS_SECRET = 'fight sim'
} = process.env;
// const port = process.env.PORT || 8080;
// const session_lifetime = process.env.SESS_LIFETIME || 1000 * 60 * 60 * 2;
// const session_name = process.env.SESS_NAME || 'sid';
// const session_secret = process.env.SESS_SECRET || 'fight sim';

const user_db = require('./javascript/user_db.js');
// const character_db = require('./javascript/character_db.js');
const character_db = require('./javascript/character_jsondb');
const fight = require('./javascript/fighting_saves');
const md5 = require('./javascript/MD5');

// console.log(md5.encrypt('hello'));
var authentication = false;
var user = 'Characters';
var name = user_db.email_get(user);

var app = express();
hbs.registerPartials(__dirname + '/views/partials');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    name: SESS_NAME,
    secret: SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: SESS_LIFETIME,
        secure: false,
        sameSite: true
    }
}));

const redirectLogin = (request, response, next) => {
    if (!request.session.userId) {
        response.redirect('/')
    } else {
        next()
    }
};

const redirectHome = (request, response, next) => {
    if (request.session.userId) {
        response.redirect('/index_b')
    } else {
        next()
    }
};

app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/views'));

app.get('/', (request, response) => {
    if (request.session.userId) {
        response.redirect('/index_b');
    } else {
        response.render('index.hbs', {
            title_page: 'Official Front Page',
            header: 'Fight Simulator',
            welcome: `Welcome ${user}`,
            username: user
        })
    }
});

app.post('/user_logging_in', (request, response) => {
    var email = request.body.email;
    var password = request.body.password;
    var output = user_db.login_check(email, password);

    if (output === 'Success!') {
        // authentication = true;
        request.session.userId = email;
        user = email;
        response.redirect('/index_b')
    } else {
        // response.redirect('/')
        response.render('index.hbs', {
            title_page: 'Official Front Page',
            header: 'Fight Simulator',
            welcome: `Welcome ${user}`,
            username: user,
            output: output
        })
    }
});

app.get('/logout', redirectLogin, (request, response) => {
    // authentication = false;
    request.session.destroy( err => {
        if (err) {
            return response.redirect('/')
        }
        // } else {
        //     response.clearCookie(SESS_NAME);
        //     response.redirect('/')
        // }
    });
    user = 'Characters';
    response.redirect('/');
});

app.get('/index_b', redirectLogin, (request, response) => {
    var name = user_db.email_get(user);
    response.render('index_b.hbs', {
        title_page: 'Official Front Page',
        header: 'Fight Simulator',
        welcome: `Welcome ${name}`,
        username: name
    })
});

app.get('/sign_up', redirectHome, (request, response) => {
    response.render('sign_up.hbs', {
        title_page: 'Sign Up Form',
        header: 'Registration Form',
        username: user
    })
});

app.post('/insert', redirectHome, (request, response) => {
    var first_name = request.body.first_name;
    var last_name = request.body.last_name;
    var email = request.body.email;
    var password = request.body.password;
    var password_repeat = request.body.password_repeat;

    var output = user_db.add_new_user(first_name, last_name, email, password, password_repeat);
    // var character_db_add = character_db.createAccount(email);
    // console.log(character_db_add);

    response.render('sign_up.hbs', {
        title_page: 'Sign Up Form',
        header: 'Registration Form',
        username: user,
        output_error: `${output}`
    })
});

app.get('/character', redirectLogin, (request, response) => {
    // if (authentication === false) {
    //     response.redirect('/')
    // } else {

    var character_detail = character_db.getDetails(user);

    if (character_detail === false) {
        response.render('character.hbs', {
            title_page: 'My Character Page',
            header: 'Character Stats',
            username: user_db.email_get(user),
            character_name: 'CREATE CHARACTER NOW',
            character_health: 'CREATE CHARACTER NOW',
            character_dps: 'CREATE CHARACTER NOW'
        })
    } else {
        response.render('character.hbs', {
            title_page: 'My Character Page',
            header: 'Character Stats',
            username: user_db.email_get(user),
            character_name: character_detail.character_name,
            character_health: character_detail.character_health,
            character_dps: character_detail.character_attack_damage
        })
    }
    //     var db = character_db.getDb();
    //     db.collection('Character').find({email: user}).toArray((err, item) => {
    //         if (err) {
    //             console.log(err)
    //         } else {
    //             try {
    //                 var character_name = item[0].character_name;
    //                 var health = item[0].health;
    //                 var dps = item[0].dps;
    //                 var name = user_db.email_get(user);
    //
    //                 response.render('character.hbs', {
    //                     title_page: 'My Character Page',
    //                     header: 'Character Stats',
    //                     username: name,
    //                     character_name: `${character_name}`,
    //                     character_health: `${health}`,
    //                     character_dps: `${dps}`
    //                 })
    //             } catch (e) {
    //                 response.render('character.hbs', {
    //                     title_page: 'My Character Page',
    //                     header: 'Character Stats',
    //                     username: name,
    //                     character_name: 'CREATE CHARACTER NOW',
    //                     character_health: 'CREATE CHARACTER NOW',
    //                     character_dps: 'CREATE CHARACTER NOW'
    //                 })
    //             }
    //         }
    //     });
    // }
});

app.get('/character_creation', redirectLogin, (request, response) => {
    // if (authentication === false) {
    //     response.redirect('/')
    // } else {

    if (character_db.authenticate(user) === true) {
        output = "You have a character ready for battle!";
        response.render('character_creation.hbs', {
            title_page: 'Character Creation',
            header: 'Create Character',
            username: name,
            output_error: `${output}`
        })
    } else {
        output = "Create a character now!";
        response.render('character_creation.hbs', {
            title_page: 'Character Creation',
            header: 'Create Character',
            username: name,
            output_error: `${output}`
        })
    }

        // try {
        //     if (character_db.authenticate(user) === true) {
        //         output = "You already have a character ready for battle!";
        //         response.render('character_creation.hbs', {
        //             title_page: 'Character Creation',
        //             header: 'Create Character',
        //             username: name,
        //             output_error: `${output}`
        //         })
        //     }
        // } catch (e) {
        //     output = "Create a character now!";
        //     response.render('character_creation.hbs', {
        //         title_page: 'Character Creation',
        //         header: 'Create Character',
        //         username: name,
        //         output_error: `${output}`
        //     })
        // }
    // }
});

app.post('/create_character', redirectLogin, (request, response) => {
    var character_name = request.body.character_name;

    var outputting = character_db.createCharacter(user, character_name);

    if (outputting !== '/user_logging_in') {
        response.redirect('/character_creation')
    } else if (outputting === '/user_logging_in') {
        response.redirect('/character')
    }



    // var db = character_db.getDb();
    //
    // db.collection('Character').find({email: user}).toArray( (err, item) => {
    //     if (err) {
    //         response.send('Unable to get all students')
    //     } else {
    //         try {
    //             if(item[0].email === user) {
    //                 response.redirect('/character_creation')
    //             }
    //         } catch (e) {
    //             var healthy = _.random(1, 100);
    //             db.collection('Character').insertOne({
    //                 character_name: character_name,
    //                 email: user,
    //                 health: healthy,
    //                 dps: _.round(healthy/3),
    //                 win: 0,
    //                 lose: 0
    //             }, (err, result) => {
    //                 if (err) {
    //                     response.send('Unable to insert stats');
    //                 }
    //                 response.redirect('/character')
    //             });
    //         }
    //     }
    // });
});


app.get('/account', redirectLogin, (request, response) => {
    // if (authentication === false) {
    //     response.redirect('/');
    // } else {

    var account_detail = character_db.getDetails(user);

    if (account_detail === false) {
        response.redirect('/account_error');
    } else {
        response.render('account.hbs', {
            name: user_db.email_get(user),
            win: account_detail.win,
            losses: account_detail.lost,
            email: user,
            header: 'Account'
        });
    }
        // character_db.getDb().collection('Character').find({email: user}).toArray((err, item) => {
        //     if (err) {
        //         console.log('err: not working buddy');
        //     } else{
        //         try {
        //             var win = item[0].win;
        //             var loses = item[0].lose;
        //             var user = item[0].email;
        //             response.render('account.hbs', {
        //                 name: name,
        //                 win: win,
        //                 losses: loses,
        //                 email: user,
        //                 header: 'Account'
        //             })
        //         } catch {
        //             response.redirect("/account_error");
        //         }
        //     }
        // });
    // }
});

app.get('/account_error', (request, response) => {
    // if (authentication === false) {
    //     response.redirect('/');
    // } else {
    var name = user_db.email_get(user);
    response.render('account_error.hbs',{
        email: user,
        header: 'Account',
        name: name
    })
    // }
});

app.get('/fight', redirectLogin, (request, response) => {
    // var outcome = 'Win';

    // if (authentication === false) {
    //     response.redirect('/');
    // } else {
        // console.log(response.body);

    var character_stats = character_db.getDetails(user);
    if (character_stats === false) {
        response.redirect('/character')
    } else {
        try {
            fight.add_info(character_stats.character_name,
            character_stats.character_health,
            character_stats.character_attack_damage);

            var arena_stats = fight.get_info(); //dictionary
            // fight.battleEnemy(arena_stats.enemy_health, arena_stats.player_dps);
            // fight.battleCharacter(arena_stats.player_health, arena_stats.enemy_dps);

            response.render('fighting.hbs', {
                title_page: `Let's fight!`,
                header: 'Fight Fight Fight!',
                username: user_db.email_get(user),
                character_name: arena_stats.player_name,
                enemy_name: `The Enemy`,
                health_player: `Health: ${arena_stats.player_health}`,
                dps_player: `DPS: ${arena_stats.player_dps}`,
                health_enemy: `Health: ${arena_stats.enemy_health}`,
                dps_enemy: `DPS: ${arena_stats.enemy_dps}`
            })
        } catch (e) {
            response.render('fighting.hbs', {
                title_page: 'Error 404',
                header: 'Error 404'
            })
        }
    }
    // }
});

    //     var db = character_db.getDb();
    //     db.collection('Character').find({email: user}).toArray( (err, item) => {
    //         if (err) {
    //             console.log(err)
    //         } else {
    //             try {
    //                 var name_player = item[0].character_name;
    //                 var health_player = item[0].health;
    //                 var dps_player = item[0].dps;

    //                 var health_enemy = _.random(health_player - 10, _.round(health_player + 5));
    //                 var dps_enemy = _.random(dps_player - 10, dps_player + 3);

    //                 fight.add_info(name_player, health_player, dps_player, health_enemy, dps_enemy);

    //                 arena_stats = fight.get_info(); //This is a dictionary

    //                 response.render('fighting.hbs', {
    //                     title_page: `Let's fight!`,
    //                     header: 'Fight Fight Fight!',
    //                     username: user,
    //                     character_name: `${name_player}`,
    //                     enemy_name: `The Enemy`,
    //                     health_player: `Health: ${health_player}`,
    //                     dps_player: `DPS: ${dps_player}`,
    //                     health_enemy: `Health: ${arena_stats.enemy_health}`,
    //                     dps_enemy: `DPS: ${arena_stats.enemy_dps}`
    //                 })
    //             } catch (e) {
    //                 response.render('fighting.hbs', {
    //                     title_page: 'Error 404',
    //                     header: 'Error 404'
    //                 })
    //             }
    //         }
    //     })
//     }
// });

app.get('/battle', redirectLogin, (request, response) => {
    // if (authentication === false) {
    //     response.redirect('/')
    // } else {
        
        // if (fight.battleOutcome === false) {
        //     response.render('win_lose_page.hbs', {
        //         win_lose: 'YOU LOSE'
        //     })
    if (fight.battleOutcome() === true) {
        // console.log('you are in the end game')
        character_db.updateWin(user);
        response.render('win_lose_page.hbs', {
            win_lose: 'YOU WIN',
            username: user_db.email_get(user)
        })
    } else if (fight.battleOutcome() === false) {

        character_db.updateLost(user);
        response.render('win_lose_page.hbs', {
            win_lose: 'YOU LOSE',
            username: user_db.email_get(user)
        })
    } else {
        var arena_stats = fight.get_info(); //This is a dictionary

        fight.battle(arena_stats.player_health, arena_stats.enemy_health, arena_stats.player_dps, arena_stats.enemy_dps);

        var result = fight.get_info();

        response.render('fighting.hbs', {
            title_page: `Let's fight!`,
            header: 'Fight Fight Fight!',
            username: user_db.email_get(user),
            character_name: result.player_name,
            enemy_name: `The Enemy`,
            health_player: `Health: ${result.player_health}`,
            dps_player: `DPS: ${result.player_dps}`,
            health_enemy: `Health: ${result.enemy_health}`,
            dps_enemy: `DPS: ${result.enemy_dps}`
        })
    }


    // }

        // console.log('BEFORE:')
        // console.log(arena_stats);

        

        // console.log('AFTER:')
        
        // console.log(result)
});

//         var player_name = arena_stats.player_name;
//
//         var player_health = arena_stats.player_health;
//         var player_dps = arena_stats.player_dps;
//
//         var enemy_health = arena_stats.enemy_health;
//         var enemy_dps = arena_stats.enemy_dps;
//
//         var new_player_health = player_health - enemy_dps;
//         var new_enemy_health = enemy_health - player_dps;
//
//         if (new_player_health > new_enemy_health && new_player_health > 0) {
//             reply = 'You are winning!'
//         } else if (new_enemy_health > new_player_health && new_player_health > 0) {
//             reply = 'Enemy is winning'
//         }
//
//         fight.add_info(player_name, new_player_health, player_dps, new_enemy_health, enemy_dps);
//
//         if (new_player_health <= 0 && new_enemy_health > 0 || new_player_health <= 0 && new_enemy_health <= 0) {
//             var db = character_db.getDb();
//             db.collection('Character').find({email: user}).toArray((err, item) => {
//                 if (err) {
//                     console.log(err)
//                 } else {
//                     var lose = item[0].lose;
//                     db.collection('Character').updateOne({email: user}, {'$set': {'lose': lose + 1}}, (err, item) => {
//                         if (err) {
//                             console.log(err)
//                         } else {
//                             var lose = 'YOU LOSE';
//                             response.render('win_lose_page.hbs', {
//                                 win_lose: `${lose}`
//                             })
//                         }
//                     })
//                 }
//             })
//         } else if (new_enemy_health <= 0 && new_player_health > 0) {
//             character_db.getDb().collection('Character').find({email: user}).toArray((err, item) => {
//                 if (err) {
//                     console.log(err)
//                 } else {
//                     var win = item[0].win;
//                     var health = item[0].health;
//                     var dps = item[0].dps;
//                     character_db.getDb().collection('Character').updateOne({email: user}, {'$set': {'health': health +5, 'dps': dps + 3, 'win': win + 1}}, (err, item) => {
//                         if (err) {
//                             console.log(err)
//                         } else {
//                             var win = 'YOU WIN!';
//                             response.render('win_lose_page.hbs', {
//                                 win_lose: `${win}`
//                             })
//                         }
//                     })
//                 }
//             })
//         } else {
//             response.render('fighting.hbs', {
//                 title_page: `Let's fight!`,
//                 header: 'Fight Fight Fight!',
//                 username: user,
//                 character_name: `${player_name}`,
//                 enemy_name: `The Enemy`,
//                 health_player: `Health: ${new_player_health}`,
//                 dps_player: `DPS: ${player_dps}`,
//                 health_enemy: `Health: ${new_enemy_health}`,
//                 dps_enemy: `DPS: ${enemy_dps}`,
//                 outcome: `${reply}`
//             })
//         }
//     }
//
// });

app.get('/win_lose_page', redirectLogin, (request, response) => {
    response.render('win_lose_page.hbs')
});

app.post('/update', redirectLogin, (request, response) => {
    var new_name = request.body.new_name;
    character_db.updateName(user, new_name);
    response.redirect('/character')
});

app.get('/update_name', redirectLogin, (request, response) => {
    response.render('update_name.hbs', {
        title_page: "Update Name",
        header: "Update Character Name",
        username: user
    })
});

app.post('/delete', redirectLogin, (request, response) => {
    character_db.deleteCharacter(user);
    response.redirect("/character")
});

app.listen(PORT, () => {
    console.log(`Server is up on the port ${PORT}`);
    // character_db.init();
});