function updateHostOptions() {
    let currentHost = getCookie('currentHost') || 'moviesapi';
    const hostSelect = document.getElementById('hostSelect');
    currentEngine = getCookie('currentEngine');

    // Clear existing options
    hostSelect.innerHTML = '';

    // Add common options
    const commonOptions = [
        { value: 'vidsrc-pro', text: 'VidSrc.pro' },
        { value: 'autoembed', text: 'AutoEmbed' },
        { value: 'superembed', text: 'SuperEmbed' },
        { value: '2embed', text: '2Embed' },
        { value: 'vidsrc-me', text: 'VidSrc.me' },
        { value: 'vidsrc-cc', text: 'VidSrc.cc' },
        { value: 'smashystream', text: 'SmashyStream' },
        { value: 'moviesapi', text: 'MoviesAPI' },
        { value: 'primewire', text: 'PrimeWire' },
        { value: 'filmku', text: 'FILMku' },
        { value: 'vidsrc-nl', text: 'VidSrc.nl' }
    ];

    commonOptions.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        hostSelect.appendChild(opt);
    });

    // Add TMDB-specific options if TMDB is the current engine
    if (currentEngine === 'tmdb') {
        const tmdbOptions = [
            { value: 'vidlink', text: 'VidLink' },
            { value: 'moviee', text: 'MoviEE' }
        ];

        tmdbOptions.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            hostSelect.appendChild(opt);
        });
    }

    // Set the current host value
    hostSelect.value = currentHost;
}

if (getCookie('currentEngine') === 'tmdb') {
    let debounceTimeout;
    let currentTmdbId = '';
    let currentSeason = 1;
    let currentEpisode = 1;
    let isSeries = false;
    let currentTitle = '';
    let currentHost = getCookie('currentHost') || 'moviesapi';

    if (!getCookie('currentHost')) {
        setCookie('currentHost', 'moviesapi', 5); // Set the cookie to 'moviesapi' if it doesn't exist
    }

    document.getElementById('hostSelect').value = currentHost;

    document.getElementById('searchInput').addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(fetchData, 1500);
    });
    
    // Call updateHostOptions on page load
    updateHostOptions();

    async function fetchData() {
        const input = document.getElementById('searchInput').value;
        if (input.trim() === '') {
            document.getElementById('output').innerHTML = '';
            return;
        }

        const movieUrl = `https://api-csmss.craeckor.ch/https://api.themoviedb.org/3/search/movie?query=${input}&include_adult=true&language=en-US&page=1`;
        const tvUrl = `https://api-csmss.craeckor.ch/https://api.themoviedb.org/3/search/tv?query=${input}&include_adult=true&language=en-US&page=1`;

        try {
            const [movieResponse, tvResponse] = await Promise.all([fetch(movieUrl), fetch(tvUrl)]);
            if (!movieResponse.ok || !tvResponse.ok) {
                throw new Error('Network response was not ok');
            }
            const movieData = await movieResponse.json();
            const tvData = await tvResponse.json();

            // Add media_type to each result
            movieData.results.forEach(item => item.media_type = 'movie');
            tvData.results.forEach(item => item.media_type = 'tv');

            displayResults([...movieData.results, ...tvData.results]);
        } catch (error) {
            document.getElementById('output').textContent = 'Error fetching data: ' + error.message;
        }
    }

    function displayResults(results) {
        const output = document.getElementById('output');
        output.innerHTML = '';

        // Sort results by popularity (higher popularity first)
        results.sort((a, b) => b.popularity - a.popularity);

        results.forEach(item => {
            const preview = document.createElement('div');
            preview.className = 'preview';
            preview.onclick = () => openIframe(item.id, item.media_type, item.title || item.name);

            // Truncate the overview to 15 words
            let overview = item.overview || 'No description available';
            const words = overview.split(' ');
            if (words.length > 15) {
                overview = words.slice(0, 15).join(' ') + '...';
            }

            // Extract the year from the release date or first air date
            const releaseYear = (item.release_date || item.first_air_date || '').split('-')[0];

            preview.innerHTML = `
                <img src="${item.poster_path ? 'https://image.tmdb.org/t/p/w200' + item.poster_path : 'assets/image/unavailed.png'}" alt="${item.title || item.name}">
                <h3>${item.title || item.name}</h3>
                <p>${overview}</p>
                <p>${releaseYear}</p>
                <p>${item.media_type === 'movie' ? 'Movie' : 'TV Series'}</p>
            `;
            output.appendChild(preview);
        });
    }

    function openIframe(tmdbId, mediaType, title) {
        currentTmdbId = tmdbId;
        isSeries = mediaType === 'tv';
        currentSeason = getCookie(`${currentTmdbId}_season`) || 1;
        currentEpisode = getCookie(`${currentTmdbId}_episode`) || 1;
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
                src = `https://vidsrc.pro/embed/tv/${currentTmdbId}/${currentSeason}/${currentEpisode}`;
            } else if (currentHost === 'autoembed') {
                src = `https://player.autoembed.cc/embed/tv/${currentTmdbId}/${currentSeason}/${currentEpisode}`;
            } else if (currentHost === 'superembed') {
                const vipCheckUrl = `https://cors.craeckor.ch/https://multiembed.mov/directstream.php?video_id=${currentTmdbId}&s=${currentSeason}&e=${currentEpisode}&check=1`;
                const vipAvailable = await checkVipAvailability(vipCheckUrl);
                if (vipAvailable) {
                    src = `https://multiembed.mov/directstream.php?video_id=${currentTmdbId}&s=${currentSeason}&e=${currentEpisode}`;
                } else {
                    src = `https://multiembed.mov/?video_id=${currentTmdbId}&s=${currentSeason}&e=${currentEpisode}`;
                }
            } else if (currentHost === '2embed') {
                src = `https://www.2embed.cc/embedtv/${currentTmdbId}&s=${currentSeason}&e=${currentEpisode}`;
            } else if (currentHost === 'vidsrc-me') {
                src = `https://vidsrc.xyz/embed/tv?tmdb=${currentTmdbId}&season=${currentSeason}&episode=${currentEpisode}`;
            } else if (currentHost === 'vidsrc-cc') {
                src = `https://vidsrc.cc/v2/embed/tv/${currentTmdbId}/${currentSeason}/${currentEpisode}`;
            } else if (currentHost === 'smashystream') {
                src = `https://player.smashy.stream/tv/${currentTmdbId}?s=${currentSeason}&e=${currentEpisode}`;
            } else if (currentHost === 'moviesapi') {
                src = `https://moviesapi.club/tv/${currentTmdbId}-${currentSeason}-${currentEpisode}`;
            } else if (currentHost === 'primewire') {
                src = `https://www.primewire.tf/embed/tv?tmdb=${currentTmdbId}&season=${currentSeason}&episode=${currentEpisode}`;
            } else if (currentHost === 'filmku') {
                src = `https://filmku.stream/embed/series?tmdb=${currentTmdbId}&sea=${currentSeason}&epi=${currentEpisode}`;
            } else if (currentHost === 'vidsrc-nl') { 
                src = `https://player.vidsrc.nl/embed/tv/${currentTmdbId}/${currentSeason}/${currentEpisode}`;
            } else if (currentHost === 'vidlink') {
                src = `https://vidlink.pro/tv/${currentTmdbId}/${currentSeason}/${currentEpisode}`;
            } else if (currentHost === 'moviee') {
                src = `https://moviee.tv/embed/tv/${currentTmdbId}?season=${currentSeason}&episode=${currentEpisode}`;
            }
            infoText.textContent = `${currentTitle} - Season ${currentSeason}, Episode ${currentEpisode}`;
            document.getElementById('seasonBackButton').style.display = 'inline';
            document.getElementById('seasonForwardButton').style.display = 'inline';
            document.getElementById('episodeBackButton').style.display = 'inline';
            document.getElementById('episodeForwardButton').style.display = 'inline';
        } else {
            if (currentHost === 'vidsrc-pro') {
                src = `https://vidsrc.pro/embed/movie/${currentTmdbId}`;
            } else if (currentHost === 'autoembed') {
                src = `https://player.autoembed.cc/embed/movie/${currentTmdbId}`;
            } else if (currentHost === 'superembed') {
                const vipCheckUrl = `https://cors.craeckor.ch/https://multiembed.mov/directstream.php?video_id=${currentTmdbId}&check=1`;
                const vipAvailable = await checkVipAvailability(vipCheckUrl);
                if (vipAvailable) {
                    src = `https://multiembed.mov/directstream.php?video_id=${currentTmdbId}`;
                } else {
                    src = `https://multiembed.mov/?video_id=${currentTmdbId}`;
                }
            } else if (currentHost === '2embed') {
                src = `https://www.2embed.cc/embed/${currentTmdbId}`;
            } else if (currentHost === 'vidsrc-me') {
                src = `https://vidsrc.xyz/embed/movie?tmdb=${currentTmdbId}`;
            } else if (currentHost === 'vidsrc-cc') {
                src = `https://vidsrc.cc/v2/embed/movie/${currentTmdbId}`;
            } else if (currentHost === 'smashystream') {
                src = `https://player.smashy.stream/movie/${currentTmdbId}`;
            } else if (currentHost === 'moviesapi') {
                src = `https://moviesapi.club/movie/${currentTmdbId}`;
            } else if (currentHost === 'primewire') {
                src = `https://www.primewire.tf/embed/movie?tmdb=${currentTmdbId}`;
            } else if (currentHost === 'filmku') {
                src = `https://filmku.stream/embed/movie?tmdb=${currentTmdbId}`;
            } else if (currentHost === 'vidsrc-nl') {
                src = `https://player.vidsrc.nl/embed/movie/${currentTmdbId}`;
            } else if (currentHost === 'vidlink') {
                src = `https://vidlink.pro/movie/${currentTmdbId}`;
            } else if (currentHost === 'moviee') {
                src = `https://moviee.tv/embed/movie/${currentTmdbId}`;
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
        setCookie(`${currentTmdbId}_season`, currentSeason, 5);
        setCookie(`${currentTmdbId}_episode`, currentEpisode, 5);
        updateIframe();
    }

    function changeEpisode(change) {
        currentEpisode = Math.max(1, currentEpisode + change);
        setCookie(`${currentTmdbId}_episode`, currentEpisode, 5);
        updateIframe();
    }

    function changeHost() {
        currentHost = document.getElementById('hostSelect').value;
        setCookie('currentHost', currentHost, 5);
        updateIframe();
    }
}