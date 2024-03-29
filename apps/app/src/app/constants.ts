import { scngxLottieAudioWave } from "@soundcore/ngx";
import { AnimationOptions } from "ngx-lottie";

export const LOCALSTORAGE_KEY_VOLUME = "__soundcore.player.volume__";
export const LOCALSTORAGE_KEY_SHUFFLED = "__soundcore.player.shuffled__";

export const DEFAULT_VOLUME = 30;
export const DEFAULT_SHUFFLED = false;

// Lottie animations options
export const AUDIOWAVE_LOTTIE_OPTIONS: AnimationOptions = {
    autoplay: true,
    loop: true,
    animationData: scngxLottieAudioWave
}