/**
 * Tina Vale — Neon Outlaws
 * Compact album preview player
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const tracks = [...document.querySelectorAll(".track")];

    if (!tracks.length) {
        return;
    }

    let activeTrack = null;

    /**
     * Converts a number of seconds to MM:SS.
     * @param {number} seconds
     * @returns {string}
     */
    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return "00:00";
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    /**
     * Restores the visual state of a track.
     * @param {HTMLElement} track
     * @param {boolean} resetAudio
     */
    const resetTrack = (track, resetAudio = false) => {
        const audio = track.querySelector("audio");
        const button = track.querySelector(".track__play");
        const title =
            track.querySelector(".track__title")?.textContent?.trim() ||
            "this track";

        if (!audio || !button) {
            return;
        }

        if (resetAudio) {
            audio.currentTime = 0;
            track.style.setProperty("--track-progress", "0%");
        }

        track.classList.remove("is-playing");
        button.setAttribute("aria-label", `Play ${title}`);
        button.setAttribute("aria-pressed", "false");
        button.dataset.state = "play";
    };

    /**
     * Stops the currently active track, except an optional track.
     * @param {HTMLElement|null} exception
     */
    const stopActiveTrack = (exception = null) => {
        if (!activeTrack || activeTrack === exception) {
            return;
        }

        const activeAudio = activeTrack.querySelector("audio");

        if (activeAudio) {
            activeAudio.pause();
        }

        resetTrack(activeTrack);
        activeTrack = null;
    };

    tracks.forEach((track) => {
        const audio = track.querySelector("audio");
        const button = track.querySelector(".track__play");
        const duration = track.querySelector(".track__duration");
        const title =
            track.querySelector(".track__title")?.textContent?.trim() ||
            "this track";

        if (!audio || !button) {
            return;
        }

        button.setAttribute("aria-pressed", "false");
        button.dataset.state = "play";
        track.style.setProperty("--track-progress", "0%");

        button.addEventListener("click", async () => {
            if (audio.paused) {
                stopActiveTrack(track);

                try {
                    await audio.play();
                    activeTrack = track;
                    track.classList.add("is-playing", "has-started");
                    track.classList.remove("has-audio-error");
                    button.setAttribute("aria-label", `Pause ${title}`);
                    button.setAttribute("aria-pressed", "true");
                    button.dataset.state = "pause";
                } catch (error) {
                    track.classList.add("has-audio-error");
                    button.setAttribute(
                        "aria-label",
                        `${title} audio is unavailable`
                    );
                    console.error(`Unable to play "${title}":`, error);
                }
            } else {
                audio.pause();
                resetTrack(track);
                activeTrack = null;
            }
        });

        audio.addEventListener("loadedmetadata", () => {
            if (duration && Number.isFinite(audio.duration)) {
                duration.textContent = formatTime(audio.duration);
                duration.setAttribute(
                    "datetime",
                    `PT${Math.round(audio.duration)}S`
                );
            }
        });

        audio.addEventListener("timeupdate", () => {
            if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
                return;
            }

            const progress = Math.min(
                100,
                Math.max(0, (audio.currentTime / audio.duration) * 100)
            );

            track.style.setProperty("--track-progress", `${progress}%`);
        });

        audio.addEventListener("ended", () => {
            resetTrack(track, true);
            activeTrack = null;
        });

        audio.addEventListener("error", () => {
            track.classList.add("has-audio-error");
            track.classList.remove("is-playing");
            button.setAttribute(
                "aria-label",
                `${title} audio is unavailable`
            );
            button.setAttribute("aria-pressed", "false");
            button.dataset.state = "error";

            if (activeTrack === track) {
                activeTrack = null;
            }
        });
    });

    // Stop playback when the page is hidden.
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && activeTrack) {
            const audio = activeTrack.querySelector("audio");

            if (audio && !audio.paused) {
                audio.pause();
                resetTrack(activeTrack);
                activeTrack = null;
            }
        }
    });
});
