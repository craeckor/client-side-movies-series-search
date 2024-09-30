function loadScript(e, t) {
    var a = document.createElement("script");
    a.type = "text/javascript",
    a.readyState ? a.onreadystatechange = function() {
        ("loaded" == a.readyState || "complete" == a.readyState) && (a.onreadystatechange = null,
        t && t())
    }
    : a.onload = function() {
        t && t()
    }
    ,
    a.src = e,
    document.getElementsByTagName("head")[0].appendChild(a),
    console.log("Loaded script: " + e)
}
document.addEventListener("DOMContentLoaded", function() {
    loadScript("assets/js/tmdb.js"),
    loadScript("assets/js/imdb.js");
});