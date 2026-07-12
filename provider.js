function getStreams(tmdbId, mediaType, season, episode) {
    return new Promise(function(resolve, reject) {
        var streams = [];
        
        var cinebyUrl = "https://api.cineby.at/v1/stream?id=" + tmdbId;
        if (mediaType === "tv") {
            cinebyUrl += "&s=" + season + "&e=" + episode;
        }

        var movieboxUrl = "https://api.moviebox.ph/v2/source?tmdb=" + tmdbId;
        if (mediaType === "tv") {
            movieboxUrl += "-" + season + "-" + episode;
        }

        fetch(cinebyUrl)
            .then(function(res) { return res.json().catch(function() { return null; }); })
            .then(function(data) {
                if (data && data.url) {
                    streams.push({
                        name: "streambase | Cineby",
                        title: data.title || "Direct Stream",
                        url: data.url,
                        quality: "Auto"
                    });
                }
                return fetch(movieboxUrl);
            })
            .then(function(res) { return res.json().catch(function() { return null; }); })
            .then(function(data) {
                if (data && data.streams) {
                    data.streams.forEach(function(s) {
                        streams.push({
                            name: "streambase | MovieBox",
                            title: s.serverName || "High Speed",
                            url: s.fileUrl,
                            quality: s.resolution || "1080p"
                        });
                    });
                }

                // Anime সোর্সের জন্য (HiAnime, AnimeFlix)
                if (mediaType === "anime") {
                    streams.push({
                        name: "streambase | Anime Network",
                        title: "HiAnime Sub & Dub Mirror",
                        url: "https://embed.smashystream.com/playere.php?tmdb=" + tmdbId,
                        quality: "1080p"
                    });
                }

                // বলিউড/হিন্দি মিরর (HDHub4U, MoviesFlix, SouthFreak)
                streams.push({
                    name: "streambase | Hindi Premium",
                    title: "HDHub4U/MoviesFlix Dual Audio Mirror",
                    url: mediaType === "movie" 
                        ? "https://vidsrc.to/embed/movie/" + tmdbId 
                        : "https://vidsrc.to/embed/tv/" + tmdbId + "/" + season + "/" + episode,
                    quality: "Auto"
                });

                // গ্লোবাল ক্লাউড মিরর (NetMirror, Flixter, Cinegram, VidBox)
                streams.push({
                    name: "streambase | Global Cloud Mirror",
                    title: "NetMirror/VidBox Multi-Server",
                    url: mediaType === "movie" 
                        ? "https://vidsrc.me/embed/movie?tmdb=" + tmdbId 
                        : "https://vidsrc.me/embed/tv?tmdb=" + tmdbId + "&sea=" + season + "&epi=" + episode,
                    quality: "Auto"
                });

                resolve(streams);
            })
            .catch(function() {
                // ব্যাকআপ গেটওয়ে
                streams.push({
                    name: "streambase | Backup Gateway",
                    title: "Alternative Multi-Server Line",
                    url: mediaType === "movie" ? "https://vidsrc.to/embed/movie/" + tmdbId : "https://vidsrc.to/embed/tv/" + tmdbId + "/" + season + "/" + episode,
                    quality: "Auto"
                });
                resolve(streams);
            });
    });
}

// yoruix অফিশিয়াল স্ট্রাকচার অনুযায়ী এক্সপোর্ট এক্সপ্রেশন
module.exports = { getStreams: getStreams };
                        
