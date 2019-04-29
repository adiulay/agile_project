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

function addData(){
    var db = firebase.firestore();
    var user_name = document.getElementById("usrname").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    if (validateForm()) {
        alert("adding data");
        db.collection("accounts").add({
            user_name: user_name,
            email: email,
            password: password
        }).then(
            alert("Thank you for your submission!")
        );
    }
}