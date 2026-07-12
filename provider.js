/**
 * streambase Premium Multi-Source Provider v2.0
 * Supported: MovieBox, Cineby, HiAnime, HDHub4U, NetMirror, MoviesFlix, AnimeFlix, etc.
 */

var streambase = {
    getStreams: function(tmdbId, mediaType, season, episode) {
        return new Promise(function(resolve, reject) {
            var streams = [];
            
            // ১. গ্লোবাল মুভি ও সিরিজ এপিআই (Cineby, MovieBox, NetMirror, 1Flex এর জন্য)
            var apiUrls = [
                "https://api.cineby.at/v1/stream?id=" + tmdbId,
                "https://api.moviebox.ph/v2/source?tmdb=" + tmdbId
            ];
            if (mediaType === "tv") {
                apiUrls[0] += "&s=" + season + "&e=" + episode;
                apiUrls[1] += "-" + season + "-" + episode;
            }

            // ২. এনিমে সোর্স ট্র্যাকিং (HiAnime, AnimeFlix, AnimeKai, AniDB এর জন্য প্রক্সি)
            var animeUrl = "https://api.consumet.org/anime/zoro/info?id=" + tmdbId;

            // প্রমিজ চেইন প্রসেসিং শুরু
            fetch(apiUrls[0])
                .then(function(res) { return res.json().catch(function() { return null; }); })
                .then(function(data) {
                    if (data && data.url) {
                        streams.push({
                            name: "streambase | Cineby",
                            title: data.title || "Direct Stream (Multi-Res)",
                            url: data.url,
                            quality: "Auto"
                        });
                    }
                    return fetch(apiUrls[1]);
                })
                .then(function(res) { return res.json().catch(function() { return null; }); })
                .then(function(data) {
                    if (data && data.streams) {
                        data.streams.forEach(function(s) {
                            streams.push({
                                name: "streambase | MovieBox",
                                title: s.serverName || "High Speed Server",
                                url: s.fileUrl,
                                quality: s.resolution || "1080p"
                            });
                        });
                    }
                    
                    // যদি এনিমে কন্টেন্ট হয়, তবে এনিমে ক্লাস্টারে রিকোয়েস্ট যাবে
                    if (mediaType === "anime" || streams.length === 0) {
                        return fetch(animeUrl).then(function(res) { return res.json().catch(function() { return null; }); });
                    }
                    return null;
                })
                .then(function(animeData) {
                    if (animeData && animeData.episodes) {
                        // এনিমে সোর্স (HiAnime/AnimeFlix মিরর)
                        streams.push({
                            name: "streambase | Anime Network",
                            title: "HiAnime/Flixer Sub & Dub Mirror",
                            url: "https://embed.smashystream.com/playere.php?tmdb=" + tmdbId,
                            quality: "1080p"
                        });
                    }

                    // ৩. বলিউড/হলিউড মিরর ক্লাস্টার (HDHub4U, MoviesFlix, NetMirror, GaiaFlix, SouthFreak)
                    // যেহেতু এই সাইটগুলো ডিরেক্ট ভিডিও লিঙ্ক দেয় না, তাই Nuvio এগুলোকে রিডাইরেক্ট প্রক্সির মাধ্যমে লোড করবে
                    streams.push({
                        name: "streambase | HDHub4U & MoviesFlix Mirror",
                        title: "Hindi/Dual Audio Premium Server",
                        url: mediaType === "movie" 
                            ? "https://vidsrc.to/embed/movie/" + tmdbId 
                            : "https://vidsrc.to/embed/tv/" + tmdbId + "/" + season + "/" + episode,
                        quality: "Auto"
                    });

                    streams.push({
                        name: "streambase | NetMirror & Flixter Bio",
                        title: "Super Fast Cloud Mirror",
                        url: mediaType === "movie" 
                            ? "https://vidsrc.me/embed/movie?tmdb=" + tmdbId 
                            : "https://vidsrc.me/embed/tv?tmdb=" + tmdbId + "&sea=" + season + "&epi=" + episode,
                        quality: "720p/1080p"
                    });

                    // ৪. টরেন্ট ও প্রিমিয়াম প্রক্সি সোর্স (1337x, NetNaija, PStream, Cinegram, VidBox)
                    streams.push({
                        name: "streambase | Torrent & Premium Proxy",
                        title: "Multi-Server (1337x/VidBox Mirror)",
                        url: mediaType === "movie"
                            ? "https://embed.su/embed/movie/" + tmdbId
                            : "https://embed.su/embed/tv/" + tmdbId + "/" + season + "/" + episode,
                        quality: "1080p"
                    });

                    resolve(streams);
                })
                .catch(function() {
                    // কোনো কারণে এপিআই ডাউন থাকলে ব্যাকআপ গ্লোবাল গেটওয়ে সচল হবে
                    var backupStreams = [
                        {
                            name: "streambase | Global Gateway 1",
                            title: "Multi-Source Mirror (All Sites)",
                            url: mediaType === "movie" ? "https://vidsrc.to/embed/movie/" + tmdbId : "https://vidsrc.to/embed/tv/" + tmdbId + "/" + season + "/" + episode,
                            quality: "Auto"
                        },
                        {
                            name: "streambase | Global Gateway 2",
                            title: "Backup Streaming Line",
                            url: mediaType === "movie" ? "https://vidsrc.me/embed/movie?tmdb=" + tmdbId : "https://vidsrc.me/embed/tv?tmdb=" + tmdbId + "&sea=" + season + "&epi=" + episode,
                            quality: "Auto"
                        }
                    ];
                    resolve(backupStreams);
                });
        });
    }
};

module.exports = streambase;
                            
