if (getCookie('currentEngine') === 'imdb') {
    let debounceTimeout;
    let currentImdbId = '';
    let currentSeason = 1;
    let currentEpisode = 1;
    let isSeries = false;
    let currentTitle = '';
    let currentHost = getCookie('currentHost') || 'moviesapi';

    if (!getCookie('currentHost_imdb') || currentHost === 'moviee' || currentHost === 'vidlink') {
        currentHost = 'moviesapi';
        setCookie('currentHost_imdb', 'moviesapi', 5); // Set the cookie to 'moviesapi' if it doesn't exist or is invalid
    }

    document.getElementById('hostSelect').value = currentHost;

    document.getElementById('searchInput').addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(fetchData, 300);
    });

    async function fetchData() {
        const input = document.getElementById('searchInput').value;
        if (input.trim() === '') {
            document.getElementById('output').innerHTML = '';
            return;
        }
        const url = `https://api-csmss.craeckor.ch/https://v3.sg.media-imdb.com/suggestion/x/${input}.json?includeVideos=1`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (!data.d) {
                throw new Error('Invalid data format');
            }
            displayResults(data.d);
        } catch (error) {
            document.getElementById('output').textContent = 'Error fetching data: ' + error.message;
        }
    }

    function displayResults(results) {
        const output = document.getElementById('output');
        output.innerHTML = '';
        results
            .filter(item => item.id.startsWith('tt'))
            .forEach(item => {
                const preview = document.createElement('div');
                preview.className = 'preview';
                preview.onclick = () => openIframe(item.id, item.qid, item.l);
                preview.innerHTML = `
                    <img src="${item.i ? item.i.imageUrl : 'https://via.placeholder.com/200'}" alt="${item.l}">
                    <h3>${item.l}</h3>
                    <p>${item.s ? item.s : 'No description available'}</p>
                    <p>${item.y ? item.y : ''}</p>
                    <p>${item.qid === 'movie' || item.qid === 'tvMovie' || item.qid === 'short' ? 'Movie' : 'TV Series'}</p>
                `;
                output.appendChild(preview);
            });
    }

    function openIframe(imdbId, qid, title) {
        currentImdbId = imdbId;
        isSeries = qid === 'tvSeries' || qid === 'tvMiniSeries';
        currentSeason = getCookie(`${currentImdbId}_season`) || 1;
        currentEpisode = getCookie(`${currentImdbId}_episode`) || 1;
        currentTitle = title;
        document.getElementById('iframeContainer').style.display = 'block';
        updateIframe(); // Ensure the iframe is updated immediately
    }

    async function updateIframe() {
        const movieIframe = document.getElementById('movieIframe');
        const infoText = document.getElementById('infoText');
        let src = '';
        if (isSeries) {
            if (currentHost === 'vidsrc-pro') {
                src = `https://vidsrc.pro/embed/tv/${currentImdbId}/${currentSeason}/${currentEpisode}`;
            } else if (currentHost === 'autoembed') {
                src = `https://player.autoembed.cc/embed/tv/${currentImdbId}/${currentSeason}/${currentEpisode}`;
            } else if (currentHost === 'superembed') {
                const vipCheckUrl = `https://cors.craeckor.ch/https://multiembed.mov/directstream.php?video_id=${currentImdbId}&s=${currentSeason}&e=${currentEpisode}&check=1`;
                const vipAvailable = await checkVipAvailability(vipCheckUrl);
                if (vipAvailable) {
                    src = `https://multiembed.mov/directstream.php?video_id=${currentImdbId}&s=${currentSeason}&e=${currentEpisode}`;
                } else {
                    src = `https://multiembed.mov/?video_id=${currentImdbId}&s=${currentSeason}&e=${currentEpisode}`;
                }
            } else if (currentHost === '2embed') {
                src = `https://www.2embed.cc/embedtv/${currentImdbId}&s=${currentSeason}&e=${currentEpisode}`;
            } else if (currentHost === 'vidsrc-me') {
                src = `https://vidsrc.xyz/embed/tv?imdb=${currentImdbId}&season=${currentSeason}&episode=${currentEpisode}`;
            } else if (currentHost === 'vidsrc-cc') {
                src = `https://vidsrc.cc/v2/embed/tv/${currentImdbId}/${currentSeason}/${currentEpisode}`;
            } else if (currentHost === 'smashystream') {
                src = `https://player.smashy.stream/tv/${currentImdbId}?s=${currentSeason}&e=${currentEpisode}`;
            } else if (currentHost === 'moviesapi') {
                src = `https://moviesapi.club/tv/${currentImdbId}-${currentSeason}-${currentEpisode}`;
            } else if (currentHost === 'primewire') {
                src = `https://www.primewire.tf/embed/tv?imdb=${currentImdbId}&season=${currentSeason}&episode=${currentEpisode}`;
            } else if (currentHost === 'filmku') {
                src = `https://filmku.stream/embed/series?imdb=${currentImdbId}&sea=${currentSeason}&epi=${currentEpisode}`;
            } else if (currentHost === 'vidsrc-nl') { 
                src = `https://player.vidsrc.nl/embed/tv/${currentImdbId}/${currentSeason}/${currentEpisode}`;
            }
            infoText.textContent = `${currentTitle} - Season ${currentSeason}, Episode ${currentEpisode}`;
            document.getElementById('seasonBackButton').style.display = 'inline';
            document.getElementById('seasonForwardButton').style.display = 'inline';
            document.getElementById('episodeBackButton').style.display = 'inline';
            document.getElementById('episodeForwardButton').style.display = 'inline';
        } else {
            if (currentHost === 'vidsrc-pro') {
                src = `https://vidsrc.pro/embed/movie/${currentImdbId}`;
            } else if (currentHost === 'autoembed') {
                src = `https://player.autoembed.cc/embed/movie/${currentImdbId}`;
            } else if (currentHost === 'superembed') {
                const vipCheckUrl = `https://cors.craeckor.ch/https://multiembed.mov/directstream.php?video_id=${currentImdbId}&check=1`;
                const vipAvailable = await checkVipAvailability(vipCheckUrl);
                if (vipAvailable) {
                    src = `https://multiembed.mov/directstream.php?video_id=${currentImdbId}`;
                } else {
                    src = `https://multiembed.mov/?video_id=${currentImdbId}`;
                }
            } else if (currentHost === '2embed') {
                src = `https://www.2embed.cc/embed/${currentImdbId}`;
            } else if (currentHost === 'vidsrc-me') {
                src = `https://vidsrc.xyz/embed/movie?imdb=${currentImdbId}`;
            } else if (currentHost === 'vidsrc-cc') {
                src = `https://vidsrc.cc/v2/embed/movie/${currentImdbId}`;
            } else if (currentHost === 'smashystream') {
                src = `https://player.smashy.stream/movie/${currentImdbId}`;
            } else if (currentHost === 'moviesapi') {
                src = `https://moviesapi.club/movie/${currentImdbId}`;
            } else if (currentHost === 'primewire') {
                src = `https://www.primewire.tf/embed/movie?imdb=${currentImdbId}`;
            } else if (currentHost === 'filmku') {
                src = `https://filmku.stream/embed/movie?imdb=${currentImdbId}`;
            } else if (currentHost === 'vidsrc-nl') {
                src = `https://player.vidsrc.nl/embed/movie/${currentImdbId}`;
            }
            infoText.textContent = currentTitle;
            document.getElementById('seasonBackButton').style.display = 'none';
            document.getElementById('seasonForwardButton').style.display = 'none';
            document.getElementById('episodeBackButton').style.display = 'none';
            document.getElementById('episodeForwardButton').style.display = 'none';
        }
        movieIframe.src = src; // Set the src attribute to load the iframe content
    }

    async function checkVipAvailability(url) {
        try {
            const response = await fetch(url);
            const text = await response.text();
            return text.trim() === '1';
        } catch (error) {
            console.error('Error checking VIP availability:', error);
            return false;
        }
    }

    function closeIframe() {
        const iframeContainer = document.getElementById('iframeContainer');
        const movieIframe = document.getElementById('movieIframe');
        movieIframe.src = '';
        iframeContainer.style.display = 'none';
    }

    function toggleFullscreen() {
        const movieIframe = document.getElementById('movieIframe');
        if (movieIframe.requestFullscreen) {
            movieIframe.requestFullscreen();
        } else if (movieIframe.mozRequestFullScreen) { // Firefox
            movieIframe.mozRequestFullScreen();
        } else if (movieIframe.webkitRequestFullscreen) { // Chrome, Safari and Opera
            movieIframe.webkitRequestFullscreen();
        } else if (movieIframe.msRequestFullscreen) { // IE/Edge
            movieIframe.msRequestFullscreen();
        }
    }

    function changeSeason(change) {
        currentSeason = Math.max(1, currentSeason + change);
        currentEpisode = 1; // Reset episode to 1 when changing season
        setCookie(`${currentImdbId}_season`, currentSeason, 5);
        setCookie(`${currentImdbId}_episode`, currentEpisode, 5);
        updateIframe();
    }
    
    function changeEpisode(change) {
        currentEpisode = Math.max(1, currentEpisode + change);
        setCookie(`${currentImdbId}_episode`, currentEpisode, 5);
        updateIframe();
    }

    function changeHost() {
        currentHost = document.getElementById('hostSelect').value;
        if (currentHost === 'moviee' || currentHost === 'vidlink') {
            currentHost = 'moviesapi';
        }
        setCookie('currentHost_imdb', currentHost, 5);
        updateIframe();
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
}