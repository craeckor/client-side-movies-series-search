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

document.addEventListener("DOMContentLoaded", function() {
    const switchButton = document.getElementById('switchEngineButton');
    currentEngine = getCookie('currentEngine') || 'imdb';
    if (!getCookie('currentEngine')) {
        setCookie('currentEngine', 'imdb', 5); // Set the cookie to 'imdb' if it doesn't exist
    }
    if (currentEngine === 'imdb') {
        switchButton.textContent = 'Switch to TMDB';
    } else {
        switchButton.textContent = 'Switch to IMDB';
    }
});