let currentEngine = getCookie('currentEngine') || 'imdb';

function switchEngine() {
    const switchButton = document.getElementById('switchEngineButton');
    
    if (currentEngine === 'imdb') {
        currentEngine = 'tmdb';
        switchButton.textContent = 'Switch to IMDB';
    } else {
        currentEngine = 'imdb';
        switchButton.textContent = 'Switch to TMDB';
    }

    setCookie('currentEngine', currentEngine, 5);
    updateHostOptions();
    location.reload();
}

function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

document.addEventListener("DOMContentLoaded", function() {
    const switchButton = document.getElementById('switchEngineButton');
    currentEngine = getCookie('currentEngine') || 'imdb'; // Check if the cookie is set
    if (!getCookie('currentEngine')) {
        setCookie('currentEngine', 'imdb', 5); // Set the cookie to 'imdb' if it doesn't exist
    }
    if (currentEngine === 'imdb') {
        switchButton.textContent = 'Switch to TMDB';
    } else {
        switchButton.textContent = 'Switch to IMDB';
    }
});