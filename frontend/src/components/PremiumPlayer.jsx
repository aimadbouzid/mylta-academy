import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, Volume2, Volume1, VolumeX, Maximize, Minimize,
  Settings, PictureInPicture, RotateCcw, RotateCw, Loader2, Check
} from 'lucide-react';

export default function PremiumPlayer({ videoUrl, onEnded, onTimeUpdate, onLoadedMetadata, onError, initialTime = 0 }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const hideControlsTimerRef = useRef(null);
  const lastClickRef = useRef({ time: 0, x: 0 });
  const hasSeekedInitialRef = useRef(false);

  // Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Hover Seek preview state
  const [hoverSeekTime, setHoverSeekTime] = useState(null);
  const [hoverSeekPos, setHoverSeekPos] = useState(0);

  // Overlay animations
  const [centerIconAnim, setCenterIconAnim] = useState(null); // 'play' | 'pause'
  const [rippleAnim, setRippleAnim] = useState(null); // { type: 'rewind' | 'forward', x: number }
  const [hudMessage, setHudMessage] = useState(null); // Toast HUD inside video player

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5];

  // Show temporary HUD message
  const triggerHud = (msg) => {
    setHudMessage(msg);
    setTimeout(() => {
      setHudMessage((prev) => (prev === msg ? null : prev));
    }, 1200);
  };

  // Format time helpers (mm:ss or hh:mm:ss)
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === null) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Auto-hide controls logic
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 2500);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
      setShowSpeedMenu(false);
    }
  };

  // Playback handlers
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setCenterIconAnim('play');
        setTimeout(() => setCenterIconAnim(null), 600);
      }).catch((err) => {
        console.warn('Autoplay/Play blocked:', err);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setCenterIconAnim('pause');
      setTimeout(() => setCenterIconAnim(null), 600);
    }
  }, []);

  const seekBy = useCallback((seconds) => {
    if (!videoRef.current) return;
    const newTime = Math.min(Math.max(0, videoRef.current.currentTime + seconds), videoRef.current.duration || 0);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    triggerHud(seconds > 0 ? `+${seconds}s` : `${seconds}s`);
  }, []);

  const handleVolumeChange = useCallback((newVol) => {
    if (!videoRef.current) return;
    const clamped = Math.min(Math.max(0, newVol), 1);
    videoRef.current.volume = clamped;
    setVolume(clamped);
    setIsMuted(clamped === 0);
    triggerHud(`Volume: ${Math.round(clamped * 100)}%`);
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      triggerHud('Son activé');
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
      triggerHud('Muet');
    }
  }, [isMuted]);

  const changeSpeed = useCallback((rate) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    triggerHud(`Vitesse: ${rate}x`);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }, []);

  const togglePip = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP error:', err);
    }
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'KeyJ':
          e.preventDefault();
          seekBy(-5);
          break;
        case 'ArrowRight':
        case 'KeyL':
          e.preventDefault();
          seekBy(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(volume - 0.1);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyP':
          e.preventDefault();
          togglePip();
          break;
        case 'Comma': // '<'
          if (e.shiftKey) {
            e.preventDefault();
            const idx = speedOptions.indexOf(playbackRate);
            if (idx > 0) changeSpeed(speedOptions[idx - 1]);
          }
          break;
        case 'Period': // '>'
          if (e.shiftKey) {
            e.preventDefault();
            const idx = speedOptions.indexOf(playbackRate);
            if (idx < speedOptions.length - 1) changeSpeed(speedOptions[idx + 1]);
          }
          break;
        case 'Digit0': case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4':
        case 'Digit5': case 'Digit6': case 'Digit7': case 'Digit8': case 'Digit9':
          if (!e.ctrlKey && !e.altKey && !e.metaKey && duration > 0) {
            e.preventDefault();
            const num = parseInt(e.code.replace('Digit', ''), 10);
            const targetTime = (duration * num) / 10;
            if (videoRef.current) {
              videoRef.current.currentTime = targetTime;
              setCurrentTime(targetTime);
              triggerHud(`${num * 10}%`);
            }
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekBy, handleVolumeChange, volume, toggleMute, toggleFullscreen, togglePip, playbackRate, changeSpeed, duration]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // PiP change listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handlePipEnter = () => setIsPip(true);
    const handlePipLeave = () => setIsPip(false);
    video.addEventListener('enterpictureinpicture', handlePipEnter);
    video.addEventListener('leavepictureinpicture', handlePipLeave);
    return () => {
      video.removeEventListener('enterpictureinpicture', handlePipEnter);
      video.removeEventListener('leavepictureinpicture', handlePipLeave);
    };
  }, []);

  // Video progress & buffer updates
  const handleTimeUpdateInternal = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);
    onTimeUpdate?.(curr);

    const video = videoRef.current;
    if (video.buffered.length > 0) {
      for (let i = 0; i < video.buffered.length; i++) {
        if (video.buffered.start(i) <= curr && curr <= video.buffered.end(i)) {
          setBuffered(video.buffered.end(i));
          break;
        }
      }
    }
  };

  // Video Click & Double Click Handling
  const handleVideoAreaClick = (e) => {
    const now = Date.now();
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (now - lastClickRef.current.time < 300) {
      if (clickX < width / 2) {
        seekBy(-10);
        setRippleAnim({ type: 'rewind', x: clickX });
      } else {
        seekBy(10);
        setRippleAnim({ type: 'forward', x: clickX });
      }
      setTimeout(() => setRippleAnim(null), 600);
    } else {
      togglePlay();
    }
    lastClickRef.current = { time: now, x: clickX };
  };

  // Timeline Seek Bar interactions
  const handleSeekSlider = (e) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPos = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const targetPercentage = clickPos / rect.width;
    const newTime = targetPercentage * duration;

    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSeekMouseMove = (e) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const time = (pos / rect.width) * duration;
    setHoverSeekPos(pos);
    setHoverSeekTime(time);
  };

  const handleSeekMouseLeave = () => {
    setHoverSeekTime(null);
  };

  if (!videoUrl) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full bg-black overflow-hidden group select-none ${
        !showControls && isPlaying ? 'cursor-none' : 'cursor-default'
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        autoPlay
        className="w-full h-full object-contain cursor-pointer"
        onClick={handleVideoAreaClick}
        onTimeUpdate={handleTimeUpdateInternal}
        onDurationChange={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            videoRef.current.playbackRate = playbackRate;
            if (initialTime > 0 && !hasSeekedInitialRef.current) {
              videoRef.current.currentTime = initialTime;
              setCurrentTime(initialTime);
              hasSeekedInitialRef.current = true;
            }
            onLoadedMetadata?.(videoRef.current);
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        onError={(e) => onError?.(e)}
      />

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none z-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-academy-primary animate-spin" />
            <span className="text-white/80 text-xs font-semibold tracking-wider uppercase bg-black/60 px-3 py-1 rounded-full">
              Chargement...
            </span>
          </div>
        </div>
      )}

      {/* Center Play/Pause Animated Pulse Icon */}
      {centerIconAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping duration-300">
          <div className="w-20 h-20 rounded-full bg-academy-primary/80 backdrop-blur-md flex items-center justify-center text-academy-onPrimary shadow-2xl">
            {centerIconAnim === 'play' ? (
              <Play className="w-10 h-10 ml-1" fill="currentColor" />
            ) : (
              <Pause className="w-10 h-10" fill="currentColor" />
            )}
          </div>
        </div>
      )}

      {/* Double Tap Skip Ripple Animations */}
      {rippleAnim && (
        <div
          className={`absolute top-0 bottom-0 w-1/2 flex items-center justify-center pointer-events-none z-30 transition-all ${
            rippleAnim.type === 'rewind' ? 'left-0 bg-gradient-to-r from-white/10 to-transparent rounded-r-full' : 'right-0 bg-gradient-to-l from-white/10 to-transparent rounded-l-full'
          }`}
        >
          <div className="flex flex-col items-center justify-center text-white bg-black/60 px-6 py-4 rounded-2xl backdrop-blur-md animate-bounce">
            {rippleAnim.type === 'rewind' ? (
              <>
                <RotateCcw className="w-8 h-8 text-academy-primary mb-1" />
                <span className="text-sm font-black">-10 SECONDES</span>
              </>
            ) : (
              <>
                <RotateCw className="w-8 h-8 text-academy-primary mb-1" />
                <span className="text-sm font-black">+10 SECONDES</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top Center Toast HUD */}
      {hudMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/10 shadow-2xl z-30 animate-fade-in">
          {hudMessage}
        </div>
      )}

      {/* Custom Video Controls Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-12 pb-3 px-4 transition-opacity duration-300 z-30 flex flex-col gap-2 ${
          showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Seek / Progress Bar Container */}
        <div
          ref={progressBarRef}
          onClick={handleSeekSlider}
          onMouseMove={handleSeekMouseMove}
          onMouseLeave={handleSeekMouseLeave}
          className="relative w-full h-3 group/timeline cursor-pointer flex items-center"
        >
          {/* Hover Time Tooltip Popup */}
          {hoverSeekTime !== null && (
            <div
              className="absolute -top-9 -translate-x-1/2 bg-black/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-white/10 shadow-lg pointer-events-none z-40"
              style={{ left: `${hoverSeekPos}px` }}
            >
              {formatTime(hoverSeekTime)}
            </div>
          )}

          {/* Track Background */}
          <div className="w-full h-1.5 group-hover/timeline:h-2.5 bg-white/20 dark:bg-academy-surfaceDark/20 rounded-full overflow-hidden relative transition-all duration-150">
            {/* Buffered Bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-white/30 dark:bg-academy-surfaceDark/30 transition-all duration-200"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Played Bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-red-500 to-academy-primary rounded-full transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Thumb Dot */}
          <div
            className="absolute w-3.5 h-3.5 bg-white dark:bg-academy-surfaceDark rounded-full shadow-md -translate-x-1/2 scale-0 group-hover/timeline:scale-100 transition-transform duration-150 border-2 border-academy-primary"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Control Buttons Bar */}
        <div className="flex items-center justify-between text-white mt-1">
          {/* Left Controls: Play/Pause, Skip 10s, Volume, Time display */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
              title={isPlaying ? 'Pause (k / Espace)' : 'Lecture (k / Espace)'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Rewind 10s */}
            <button
              onClick={() => seekBy(-10)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block focus:outline-none"
              title="Reculer 10s (j)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Fast Forward 10s */}
            <button
              onClick={() => seekBy(10)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block focus:outline-none"
              title="Avancer 10s (l)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume Control Group */}
            <div className="flex items-center group/vol relative">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
                title={isMuted ? 'Activer le son (m)' : 'Couper le son (m)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              {/* Volume Slider on hover */}
              <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-300 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-white/30 dark:bg-academy-surfaceDark/30 accent-academy-primary rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Current Time / Duration */}
            <div className="text-xs font-semibold text-white/80 tracking-wide ml-1">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/40 mx-1">/</span>
              <span className="text-white/50">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Speed Settings, PiP, Fullscreen */}
          <div className="flex items-center gap-1 sm:gap-2 relative">
            {/* Speed Settings Button & Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all focus:outline-none ${
                  playbackRate !== 1
                    ? 'bg-academy-primary text-academy-onPrimary'
                    : 'hover:bg-white/10 text-white/80'
                }`}
                title="Vitesse de lecture"
              >
                <span>{playbackRate}x</span>
                <Settings className="w-3.5 h-3.5" />
              </button>

              {/* Speed Popover Dropdown */}
              {showSpeedMenu && (
                <div className="absolute bottom-10 right-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 w-36 shadow-2xl z-50 flex flex-col gap-1">
                  <div className="text-[10px] font-bold uppercase text-white/40 px-3 py-1 border-b border-white/10">
                    Vitesse
                  </div>
                  {speedOptions.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changeSpeed(rate)}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        playbackRate === rate
                          ? 'bg-academy-primary/20 text-academy-primary font-bold'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <span>{rate === 1 ? 'Normal (1x)' : `${rate}x`}</span>
                      {playbackRate === rate && <Check className="w-3.5 h-3.5 text-academy-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Picture-in-Picture Button */}
            {document.pictureInPictureEnabled && (
              <button
                onClick={togglePip}
                className={`p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block focus:outline-none ${
                  isPip ? 'text-academy-primary' : 'text-white/80'
                }`}
                title="Image dans l'image (p)"
              >
                <PictureInPicture className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 focus:outline-none"
              title={isFullscreen ? 'Quitter plein écran (f)' : 'Plein écran (f)'}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
