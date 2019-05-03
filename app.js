const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const session = require('express-session');
const axios = require('axios');
const _ = require('lodash');
const fs = require('fs');

const path = require('path');

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

// console.log(md5.encrypt('hello'));
// var authentication = false;
var user = 'Characters';
// var name = user_db.email_get(user);

var app = express();
// hbs.registerPartials(path.join(__dirname, '../', '/views/partials'));
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
// app.use(express.static(path.join(__dirname, '../', '/views')));

app.get('/', redirectHome, (request, response) => {
    // if (request.session.userId) {
    //     response.redirect('/index_b');
    // } else {
    response.render('index.hbs', {
        title_page: 'Official Front Page',
        header: 'Fight Simulator',
        username: user
    })
    // }
});

app.post('/user_logging_in', async (request, response) => {
    var email = request.body.email;
    var password = request.body.password;
    var output = await user_db.login_check(email, password);

    if (output === 'Success!') {
        // authentication = true;
        user = email;
        request.session.userId = await user_db.email_get(user);
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
    request.session.destroy( err => {
        if (err) {
            request.session.clearCookie(SESS_NAME);
            return response.redirect('/')
        }
    });
    user = 'Characters';
    response.redirect('/');
});

app.get('/index_b', redirectLogin, (request, response) => {
    // var name = await user_db.email_get(user);
    response.render('index_b.hbs', {
        title_page: 'Official Front Page',
        header: 'Fight Simulator',
        welcome: `Welcome ${request.session.userId}`,
        username: request.session.userId
    })
});

app.get('/sign_up', redirectHome, (request, response) => {
    response.render('sign_up.hbs', {
        title_page: 'Sign Up Form',
        header: 'Registration Form',
        username: user
    })
});

app.post('/insert', redirectHome, async (request, response) => {
    var first_name = request.body.first_name;
    var last_name = request.body.last_name;
    var email = request.body.email;
    var password = request.body.password;
    var password_repeat = request.body.password_repeat;

    var output = await user_db.add_new_user(first_name, last_name, email, password, password_repeat);
    // var character_db_add = character_db.createAccount(email);
    // console.log(character_db_add);

    response.render('sign_up.hbs', {
        title_page: 'Sign Up Form',
        header: 'Registration Form',
        username: user,
        output_error: `${output}`
    })
});

app.get('/character', redirectLogin, async (request, response) => {
    var character_detail = await character_db.getDetails(user);

    if (character_detail === false) {
        response.render('character.hbs', {
            title_page: 'My Character Page',
            header: 'Character Stats',
            username: request.session.userId,
            character_name: 'CREATE CHARACTER NOW',
            character_health: 'CREATE CHARACTER NOW',
            character_dps: 'CREATE CHARACTER NOW'
        })
    } else {
        response.render('character.hbs', {
            title_page: 'My Character Page',
            header: 'Character Stats',
            username: request.session.userId,
            character_name: character_detail.character_name,
            character_health: character_detail.character_health,
            character_dps: character_detail.character_attack_damage
        })
    }
});

app.get('/character_creation', redirectLogin, async (request, response) => {
    // var name = await user_db.email_get(user);

    var authenticate = await character_db.authenticate(user);

    if (authenticate === true) {
        output = "You have a character ready for battle!";
        response.render('character_creation.hbs', {
            title_page: 'Character Creation',
            header: 'Create Character',
            username: request.session.userId,
            output_error: `${output}`
        })
    } else {
        output = "Create a character now!";
        response.render('character_creation.hbs', {
            title_page: 'Character Creation',
            header: 'Create Character',
            username: request.session.userId,
            output_error: `${output}`
        })
    }
});

app.post('/create_character', redirectLogin, (request, response) => {
    var character_name = request.body.character_name;

    var outputting = character_db.createCharacter(user, character_name);

    if (outputting !== '/user_logging_in') {
        response.redirect('/character_creation')
    } else if (outputting === '/user_logging_in') {
        response.redirect('/character')
    }
});


app.get('/account', redirectLogin, async (request, response) => {
    var account_detail = await character_db.getDetails(user);

    if (account_detail === false) {
        response.redirect('/account_error');
    } else {
        response.render('account.hbs', {
            name: request.session.userId,
            win: account_detail.win,
            losses: account_detail.lost,
            email: user,
            header: 'Account'
        });
    }
});

app.get('/account_error', async (request, response) => {
    // var name = await user_db.email_get(user);
    response.render('account_error.hbs',{
        email: user,
        header: 'Account',
        name: request.session.userId
    })
});

app.get('/fight', redirectLogin, async (request, response) => {
    var character_stats = await character_db.getDetails(user);
    if (character_stats === false) {
        response.redirect('/character')
    } else {
        try {
            await fight.add_info(character_stats.character_name,
            character_stats.character_health,
            character_stats.character_attack_damage,
                user);

            var arena_stats = await fight.get_info(user); //dictionary
            // fight.battleEnemy(arena_stats.enemy_health, arena_stats.player_dps);
            // fight.battleCharacter(arena_stats.player_health, arena_stats.enemy_dps);

            response.render('fighting.hbs', {
                title_page: `Let's fight!`,
                header: 'Fight Fight Fight!',
                username: request.session.userId,
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
});

app.get('/battle', redirectLogin, async (request, response) => {
    if (await fight.battleOutcome(user) === true) {
        // console.log('you are in the end game')
        await character_db.updateWin(user);
        response.render('win_lose_page.hbs', {
            win_lose: 'YOU WIN',
            username: request.session.userId
        })
    } else if (await fight.battleOutcome(user) === false) {

        await character_db.updateLost(user);
        response.render('win_lose_page.hbs', {
            win_lose: 'YOU LOSE',
            username: request.session.userId
        })
    } else {
        var arena_stats = await fight.get_info(user); //This is a dictionary

        await fight.battle(arena_stats.player_health, arena_stats.enemy_health, arena_stats.player_dps, arena_stats.enemy_dps,
            user);

        var result = await fight.get_info(user);

        response.render('fighting.hbs', {
            title_page: `Let's fight!`,
            header: 'Fight Fight Fight!',
            username: request.session.userId,
            character_name: result.player_name,
            enemy_name: `The Enemy`,
            health_player: `Health: ${result.player_health}`,
            dps_player: `DPS: ${result.player_dps}`,
            health_enemy: `Health: ${result.enemy_health}`,
            dps_enemy: `DPS: ${result.enemy_dps}`
        })
    }
});

app.post('/update', redirectLogin, async (request, response) => {
    var new_name = request.body.new_name;
    await character_db.updateName(user, new_name);
    response.redirect('/character')
});

app.get('/update_name', redirectLogin, async (request, response) => {
    var authenticate_character_existence = await character_db.authenticate(user);

    if (authenticate_character_existence === false) {
        response.redirect('/character')
    } else {
        response.render('update_name.hbs', {
            title_page: "Update Name",
            header: "Update Character Name",
            username: request.session.userId
        })
    }
});

app.post('/delete', redirectLogin, async (request, response) => {
    character_db.deleteCharacter(user);
    response.render('character.hbs', {
        title_page: 'My Character Page',
        header: 'Character Stats',
        username: request.session.userId,
        character_name: 'CREATE CHARACTER NOW',
        character_health: 'CREATE CHARACTER NOW',
        character_dps: 'CREATE CHARACTER NOW'
    })
});

app.listen(PORT, () => {
    console.log(`Server is up on the port ${PORT}`);
    // character_db.init();
});

module.exports = app;