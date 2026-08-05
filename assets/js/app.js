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

/* Photo gallery modal */
document.addEventListener("DOMContentLoaded",()=>{const modal=document.querySelector("#photo-gallery-modal"),triggers=[...document.querySelectorAll(".gallery-trigger")];if(!modal||!triggers.length)return;const close=[...modal.querySelectorAll("[data-gallery-close]")],prev=modal.querySelector("[data-gallery-previous]"),next=modal.querySelector("[data-gallery-next]"),image=modal.querySelector(".gallery-viewer__image"),caption=modal.querySelector("[data-gallery-caption]"),counter=modal.querySelector("[data-gallery-counter]"),thumbs=[...modal.querySelectorAll("[data-gallery-index]")],photos=[1,2,3,4,5,6].map((n)=>({src:`assets/images/gallery/gallery-${String(n).padStart(2,"0")}.jpg`,alt:`Tina gallery photo ${n}`,caption:["Tina — Neon Outlaws","Neon portrait","After midnight","Exit City","Studio session","Behind the signal"][n-1]}));let current=0,lastFocus=null;const update=(i)=>{current=(i+photos.length)%photos.length;const p=photos[current];image.classList.add("is-changing");setTimeout(()=>{image.src=p.src;image.alt=p.alt;caption.textContent=p.caption;counter.textContent=`${current+1} / ${photos.length}`;thumbs.forEach((t,j)=>{t.classList.toggle("is-active",j===current);j===current?t.setAttribute("aria-current","true"):t.removeAttribute("aria-current")});image.classList.remove("is-changing")},90)};const open=()=>{lastFocus=document.activeElement;modal.classList.add("is-open");modal.setAttribute("aria-hidden","false");document.body.classList.add("gallery-is-open");update(current);setTimeout(()=>modal.querySelector(".gallery-modal__close")?.focus(),50)};const shut=()=>{modal.classList.remove("is-open");modal.setAttribute("aria-hidden","true");document.body.classList.remove("gallery-is-open");lastFocus?.focus?.()};triggers.forEach(t=>t.addEventListener("click",open));close.forEach(b=>b.addEventListener("click",shut));prev?.addEventListener("click",()=>update(current-1));next?.addEventListener("click",()=>update(current+1));thumbs.forEach(t=>t.addEventListener("click",()=>update(Number(t.dataset.galleryIndex))));modal.addEventListener("keydown",e=>{if(e.key==="Escape")shut();if(e.key==="ArrowLeft")update(current-1);if(e.key==="ArrowRight")update(current+1)})});
