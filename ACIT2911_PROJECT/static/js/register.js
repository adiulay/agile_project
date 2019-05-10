function checkName() {
    var name = document.getElementById("usrname").value;
    if (name === null || name === "") {
        alert("Please input your name!!");
        return false;
    }else {
        return true;
    }
}

function checkEmail() {
    var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
    var email = document.getElementById("email").value;
    if(email === ""){
        alert("Please input your email !!");
        return false;
    }else if(!reg.test(email)){
        alert("Not a valid email !!");
        return false;
    }else{
        return true;
    }
}

function checkPass() {
    var password = document.getElementById("password").value;
    var re_password = document.getElementById("re_password").value;
    if (password !== re_password)
    {
        alert("Password Not matched!");
        return false;
    }else {
        return true;
    }
}

function validateForm() {
    return checkName() && checkEmail() && checkPass();
}

function UploadFile() {
    var formDa=new FormData();
    var file=document.getElementById("fileButton").files[0];
    formDa.append("img",file);
    var user_name=document.getElementById("usrname").value;
    formDa.append("usr_name", user_name);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        var data=xhr.responseText;
        console.log(data);
    };
    xhr.open("post","/saveface",true);
    xhr.send(formDa);
}

function addData(){
    var passwordHash = require('password-hash');
    var fire_database = firebase.firestore();
    var fire_auth = firebase.auth();
    var user_name = document.getElementById("usrname").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var file = document.getElementById("fileButton").files.item(0);
    if (validateForm()) {
        alert("adding data");
        UploadFile();
        fire_auth.createUserWithEmailAndPassword(email,
        password).then(function() {
            var user = fire_auth.currentUser;
            user.updateProfile({
                displayName: user_name
            }).then(function () {
                alert(user.displayName);
            }, function (error) {
                console.log(error);
            });
        }).catch(function(error) {
            // Handle Errors here
            alert("error"+ error.message);
        });

        if (fire_auth.currentUser != null) {
            fire_auth.currentUser.updateProfile({
                displayName: user_name
            }).then(function () {
                alert("Updated");
                console.log("Updated");
            }, function (error) {
                console.log("Error happened");
            });
        }
        fire_database.collection("accounts").doc(document.getElementById("email").value).set({
            username: user_name,
            email: email,
            password: passwordHash.generate(password)
        }).then(
            alert("Thank you for your submission!")
        );
    }
}