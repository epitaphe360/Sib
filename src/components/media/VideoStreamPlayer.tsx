import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface VideoStreamPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  isLive?: boolean;
  autoPlay?: boolean;
  controls?: boolean;
  onEnded?: () => void;
}

export const VideoStreamPlayer: React.FC<VideoStreamPlayerProps> = ({
  src,
  poster,
  title,
  isLive = false,
  autoPlay = false,
  controls = true,
  onEnded
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState<'auto' | '1080p' | '720p' | '480p'>('auto');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.volume = newMuted ? 0 : volume;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Détecter si c'est une URL YouTube
  const isYouTube = src?.includes('youtube.com') || src?.includes('youtu.be');
  
  // Convertir l'URL YouTube en format embed si nécessaire
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Si c'est déjà une URL embed, la retourner
    if (url.includes('/embed/')) return url;
    
    // Extraire l'ID de la vidéo
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}` : url;
  };

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* YouTube iFrame ou Video Element */}
      {isYouTube ? (
        <iframe
          src={getYouTubeEmbedUrl(src)}
          className="w-full aspect-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title || 'Video'}
        />
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          className="w-full h-full"
          onClick={togglePlay}
        />
      )}

      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-4 right-4">
          <Badge variant="destructive" className="animate-pulse">
            🔴 EN DIRECT
          </Badge>
        </div>
      )}

      {/* Title Overlay */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
      )}

      {/* Play/Pause Overlay */}
      {!isPlaying && !isYouTube && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="default"
            size="lg"
            onClick={togglePlay}
            className="rounded-full w-20 h-20 bg-white/20 backdrop-blur-sm hover:bg-white/30"
          >
            <Play className="h-10 w-10 text-white ml-1" />
          </Button>
        </div>
      )}

      {/* Controls */}
      {controls && !isYouTube && (
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Bar */}
          {!isLive && (
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-white/80 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {!isLive && (
                <span className="text-white text-sm ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative group/quality">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 hidden group-hover/quality:block">
                  <div className="text-white text-xs space-y-1 whitespace-nowrap">
                    <div className="font-semibold mb-2">Qualité vidéo</div>
                    {['auto', '1080p', '720p', '480p'].map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q as any)}
                        className={`block w-full text-left px-2 py-1 rounded ${
                          quality === q ? 'bg-blue-600' : 'hover:bg-white/10'
                        }`}
                      >
                        {q === 'auto' ? 'Auto' : q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
