# Introduction

This simple website is kind of a PoC (Proof of Concept) for showing the possibility with a (almost*) client-side streaming-website. It uses the "Search IMDb"-API from IMDb. These results are the same if you go to IMDb and search something in the search-box without hitting enter or clicking the search-icon. This API doesn't require any kind of authentication and also doesn't enforce stuff like CORS. I could do more stuff like "Ecact matches" but this would require a server-side API and this isn't the goal here. That's why you will likely don't get every result if you don't search a specific movie / series or just use a keyword of the movie / series. But the fact that all this (almost) works client-side is a fully win.

# Setup
1. Clone this repo into your ```www``` folder with ```git clone https://github.com/craeckor/client-side-movies-series-search.git```
2. Start your webserver
3. Access your webserver in the browser.

# CORS
CORS is something which you cannot really achieve client-side and that's why I'm forced to use a CORS-bypasser one time. This problem is with multiembed.mov where the VIP-stream-check requires CORS for some reason. The stream itself doesn't. For this I use cors.craeckor.ch. The second problem is the IMDB-API. I'm also force to use CORS-bypasser there.