"use client";

import * as React from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Video,
  Film,
} from "lucide-react";
import { toPersianDigits } from "@/shared/lib/utils";

export interface MediaPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  caption?: string;
  isActiveSlide?: boolean;
  className?: string;
  autoPlay?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "۰۰:۰۰";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const formatted = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return toPersianDigits(formatted);
}

export function MediaPlayer({
  src,
  poster,
  title,
  caption,
  isActiveSlide = true,
  className = "",
  autoPlay = false,
  onPlayStateChange,
}: MediaPlayerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [userIsActive, setUserIsActive] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = React.useState(false);

  // Auto-pause when slide becomes inactive in Swiper
  React.useEffect(() => {
    if (!isActiveSlide && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    }
  }, [isActiveSlide, onPlayStateChange]);

  // Handle Fullscreen Change listener
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Controls auto-hide timer when playing
  const resetControlsTimeout = React.useCallback(() => {
    setUserIsActive(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setUserIsActive(false);
        setShowSpeedMenu(false);
      }, 2600);
    }
  }, [isPlaying]);

  React.useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const isControlsVisible = !isPlaying || userIsActive;


  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
          onPlayStateChange?.(true);
        })
        .catch(() => {
          // Playback failed or blocked
          setIsPlaying(false);
          onPlayStateChange?.(false);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoading(false);
    setHasError(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setVolume(newVol);
      setIsMuted(newVol === 0);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fallback
    }
  };

  const handleSpeedSelect = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        onPlayStateChange?.(true);
      });
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onMouseEnter={() => setUserIsActive(true)}
      onMouseLeave={() => {
        if (isPlaying) setUserIsActive(false);
        setShowSpeedMenu(false);
      }}
      className={`group relative w-full h-full select-none overflow-hidden bg-black flex items-center justify-center ${className}`}
      dir="rtl"
    >
      {/* ── Native HTML5 Video Element ────────────────────────────────────── */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
          onPlayStateChange?.(true);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setUserIsActive(true);
          onPlayStateChange?.(false);
        }}

        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* ── Video Poster Overlay (When Not Started) ────────────────────────── */}
      {!isPlaying && currentTime === 0 && poster && !hasError && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-10 cursor-pointer overflow-hidden"
        >
          <Image
            src={poster}
            alt={title || "پیش‌نمایش ویدیو"}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1000px"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-colors group-hover:bg-black/30" />
        </div>
      )}

      {/* ── Error Fallback ─────────────────────────────────────────────────── */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-neutral-950/95 text-neutral-300">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3">
            <Film className="h-7 w-7" />
          </div>
          <p className="text-base font-bold text-white mb-1">
            {title || "پخش‌کننده ویدیویی ققنوس آکادمی"}
          </p>
          <p className="text-xs text-neutral-400 max-w-sm mb-4 leading-relaxed">
            {caption ||
              "این بخش شامل محتوای ویدیویی تخصصی پروژه است. در محیط آزمایشی ممکن است نیاز به اتصال شبکه داشته باشد."}
          </p>
          <button
            onClick={() => {
              setHasError(false);
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().catch(() => {});
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>تلاش مجدد برای پخش</span>
          </button>
        </div>
      )}

      {/* ── Top Bar (Badge & Title) ────────────────────────────────────────── */}
      <div
        className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none ${
          isControlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-orange-600/30 px-3 py-1 text-xs font-bold text-orange-300 backdrop-blur-md">
            <Video className="h-3.5 w-3.5" />
            <span>ویدیو</span>
          </span>
          {title && (
            <span className="text-xs sm:text-sm font-semibold text-white/90 drop-shadow truncate max-w-[200px] sm:max-w-md">
              {title}
            </span>
          )}
        </div>
      </div>

      {/* ── Center Big Play / Pause Button ─────────────────────────────────── */}
      {!hasError && (
        <div
          onClick={togglePlay}
          className={`absolute inset-0 z-20 flex items-center justify-center cursor-pointer transition-opacity duration-300 ${
            isControlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border border-orange-500/40 bg-black/60 backdrop-blur-md text-orange-400 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white ${
              isPlaying ? "scale-90 opacity-0 group-hover:opacity-100" : "scale-100 opacity-100"
            }`}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 fill-current" />
            ) : (
              <Play className="h-8 w-8 fill-current translate-x-[-2px]" />
            )}
          </div>
        </div>
      )}

      {/* ── Buffering Spinner ──────────────────────────────────────────────── */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 pointer-events-none">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      )}

      {/* ── Bottom Controls Bar ────────────────────────────────────────────── */}
      {!hasError && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-0 inset-x-0 z-30 flex flex-col justify-end p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent transition-opacity duration-300 ${
            isControlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >

          {/* Timeline / Scrubber */}
          <div className="group/timeline relative w-full mb-3 flex items-center cursor-pointer">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="نوار زمان ویدیو"
              className="w-full h-1.5 sm:h-2 rounded-full appearance-none bg-neutral-700/80 accent-orange-500 cursor-pointer focus:outline-none transition-all group-hover/timeline:h-2.5"
              style={{
                background: `linear-gradient(to left, #ea580c 0%, #ea580c ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%, rgba(255,255,255,0.2) 100%)`,
              }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 text-white text-xs">
            {/* Right: Play/Pause, Replay, Time */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "توقف ویدیو" : "پخش ویدیو"}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-orange-600 hover:text-white transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="h-4 w-4 fill-current translate-x-[-1px]" />
                )}
              </button>

              <button
                type="button"
                onClick={handleRestart}
                aria-label="پخش مجدد از ابتدا"
                className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-neutral-300 hover:text-white"
                title="پخش از ابتدا"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              {/* Time display */}
              <div className="flex items-center gap-1 font-mono text-[11px] sm:text-xs text-neutral-300">
                <span>{formatTime(currentTime)}</span>
                <span className="text-neutral-500">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Left: Volume, Speed, Fullscreen */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Volume Slider & Toggle */}
              <div className="group/vol flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "صدادار" : "بی‌صدا"}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-neutral-300 hover:text-white"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-red-400" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="بلندی صدا"
                  className="w-14 sm:w-20 h-1 sm:h-1.5 rounded-full appearance-none bg-neutral-700 accent-orange-500 cursor-pointer hidden group-hover/vol:block transition-all"
                />
              </div>

              {/* Speed Selector Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  aria-label="سرعت پخش"
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-mono font-bold transition-colors cursor-pointer text-neutral-200"
                >
                  {playbackSpeed}x
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-9 left-0 z-40 flex flex-col rounded-xl border border-neutral-800 bg-[#16161b] p-1 shadow-2xl min-w-[70px]">
                    {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => handleSpeedSelect(spd)}
                        className={`px-3 py-1.5 text-center text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                          playbackSpeed === spd
                            ? "bg-orange-600 text-white font-bold"
                            : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "خروج از تمام‌صفحه" : "حالت تمام‌صفحه"}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-neutral-300 hover:text-white"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
