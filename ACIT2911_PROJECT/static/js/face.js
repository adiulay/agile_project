var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var timeOut = 5 * 1000; // time out at 6 seconds
var start_time = 0

function getUserMediaToPhoto(constraints,success,error) {
    navigator.getUserMedia_ = (navigator.mediaDevices.getUserMedia
        || navigator.webkitGetUserMedia
        || navigator.mozGetUserMedia
        || navigator.msGetUserMedia);
    if (!!navigator.getUserMedia_) {
        navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
    }
}
//successfully recall
function success(stream){
    start_time = new Date().getTime();
    //Video to media stream
    video.srcObject = stream;
    video.play();//play the stream
    //video to canvas
    postFace()
}

function error(error) {
    console.log('Can NOT open the webcam：',error.name,error.message);
}

function postFace() {
    setTimeout(function () {
        context.drawImage(video,0,0,480,320);
        img=canvas.toDataURL('image/jpg');
        img=img.split(',')[1];
        //use ajax to sent pic to the backstage
        $.post({
        url:'/getface',
        data:{
            message:img
        },
        success:function (callback) {
            try {
                if(callback=='login_failed'){
                    current_time = new Date().getTime();
                    if (current_time - start_time < timeOut) {
                        postFace()
                    } else {
                        //window.location.href="/register"
                        throw "time_out";
                    }
                } else if (callback=='login_success') {
                        document.getElementById("result_pic").src = "../static/imgs/tick.png";
                        document.getElementById("result_div").style.display = "block";
                        setTimeout(function(){
                            window.location.href="http://localhost:8080/success"
                        },1400);
                } else {
                    window.location.href=callback
                }
            } catch (error) {
                document.getElementById("result_pic").src = "../static/imgs/cuohao.png";
                document.getElementById("result_div").style.display = "block";
                video.srcObject.getTracks()[0].stop();
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.restore();
                setTimeout(function(){
                    document.getElementById("result_pic").src = "";
                    document.getElementById("result_div").style.display = "none";
                },1900)
            }
        },
        error:function (callback) {
            postFace()
        }
    })
    },300)
}

function faceLogin() {
    if(navigator.mediaDevices.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia){
        getUserMediaToPhoto({video:{width:480,height:320}},success,error);
    }else{
        alert("Your brower doesn't support webcam");
    }
};