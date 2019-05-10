function checkEmail(email) {
    var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
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

function signIn(){
    var email = document.getElementById("usr_email").value;
    var password = document.getElementById("usr_pass").value;
    if (checkEmail(email)) {
        alert("Signing In");
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
            alert(error.code);
            if (error.code === "auth/user-not-found") { // Account NOT found
                alert("Account NOT found !");
            } else if (error.code === "auth/invalid-password") { // Wrong password
                alert("Password is incorrect !!");
            } else {
                alert("Error signing in");
                console.log(error);
            }
        });
    } else {
        alert("Please enter a valid email !");
    }
}

function signOut(){
    firebase.auth().signOut().then(function() {
        alert("Signed out!");
    }).catch(function(error) {
        alert("Error signing out");
        console.log(error);
    });
}