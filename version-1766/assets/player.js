(function () {
    function initializePlayer(source, videoId, maskId) {
        var video = document.getElementById(videoId);
        var mask = document.getElementById(maskId);
        var loaded = false;
        var player = null;

        if (!video || !source) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                player = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                player.loadSource(source);
                player.attachMedia(video);
                player.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal || !player) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        player.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        player.recoverMediaError();
                    } else {
                        player.destroy();
                    }
                });
            } else {
                video.src = source;
            }
        }

        function play() {
            load();
            var request = video.play();
            if (request && typeof request.then === "function") {
                request.then(function () {
                    if (mask) {
                        mask.classList.add("is-hidden");
                    }
                }).catch(function () {
                    if (mask) {
                        mask.classList.remove("is-hidden");
                    }
                });
            } else if (mask) {
                mask.classList.add("is-hidden");
            }
        }

        if (mask) {
            mask.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (mask) {
                mask.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (mask && !video.ended) {
                mask.classList.remove("is-hidden");
            }
        });

        video.addEventListener("ended", function () {
            if (mask) {
                mask.classList.remove("is-hidden");
            }
        });
    }

    window.initializePlayer = initializePlayer;
})();
