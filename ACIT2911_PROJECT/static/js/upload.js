var uploader = document.getElementById("uploader");
var fileButton = document.getElementById("fileButton");
var holder = document.getElementById("holder");

function getFileUrl(sourceId) {
    var url;
    if (navigator.userAgent.indexOf("MSIE")>=1) { // IE
        url = document.getElementById(sourceId).value;
    } else if(navigator.userAgent.indexOf("Firefox")>0) { // Firefox
        url = window.URL.createObjectURL(document.getElementById(sourceId).files.item(0));
    } else if(navigator.userAgent.indexOf("Chrome")>0) { // Chrome
        url = window.URL.createObjectURL(document.getElementById(sourceId).files.item(0));
    }
    return url;
}

window.onload = function() {
    fileButton.addEventListener('change', function(e){
        // preview
        holder.src = getFileUrl("fileButton");
    });
};
