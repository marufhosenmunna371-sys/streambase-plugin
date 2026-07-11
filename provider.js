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
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data && data.url) {
                    streams.push({
                        name: "Cineby Server 1",
                        title: data.title || "Auto Stream (Multi-Res)",
                        url: data.url,
                        quality: "Auto"
                    });
                }
                return fetch(movieboxUrl);
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data && data.streams && data.streams.length > 0) {
                    data.streams.forEach(function(stream) {
                        streams.push({
                            name: "Moviebox Backup",
                            title: stream.serverName || "High Speed Stream",
                            url: stream.fileUrl,
                            quality: stream.resolution || "1080p"
                        });
                    });
                }

                if (streams.length === 0) {
                    streams.push({
                        name: "Fmovies/Vegamovie Mirror",
                        title: "Alternative Server (May contain ads)",
                        url: "https://vidsrc.me/embed/movie?tmdb=" + tmdbId,
                        quality: "720p"
                    });
                }

                resolve(streams);
            })
            .catch(function(error) {
                streams.push({
                    name: "Global Auto Streamer",
                    title: "Backup Server",
                    url: mediaType === "movie" 
                        ? "https://vidsrc.to/embed/movie/" + tmdbId 
                        : "https://vidsrc.to/embed/tv/" + tmdbId + "/" + season + "/" + episode,
                    quality: "Auto"
                });
                resolve(streams);
            });
    });
}

module.exports = { getStreams: getStreams };
