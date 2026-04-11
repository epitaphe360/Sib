import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader, AlertCircle, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { ArticleAudioService, ArticleAudio } from '../../services/articleAudioService';
import { toast } from 'sonner';

interface ArticleAudioPlayerProps {
  articleId: string;
  articleText: string;
  articleTitle: string;
  language?: string;
}

export default function ArticleAudioPlayer({
  articleId,
  articleText,
  articleTitle,
  language = 'fr'
}: ArticleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<ArticleAudio | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [useClientSide, setUseClientSide] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Charger l'audio existant au montage
  useEffect(() => {
    loadAudio();
  }, [articleId]);

  const loadAudio = async () => {
    setIsLoading(true);
    try {
      const existingAudio = await ArticleAudioService.getArticleAudio(articleId, language);
      if (existingAudio && existingAudio.status === 'ready') {
        setAudio(existingAudio);
        setUseClientSide(false);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertToAudio = async () => {
    setIsLoading(true);
    try {
      toast.loading('Conversion de l\'article en audio...', { id: 'audio-conversion' });

      const result = await ArticleAudioService.convertArticleToAudio(
        articleId,
        articleText,
        language
      );

      if (result.success) {
        if (result.useClientSide) {
          // Utiliser la synthèse vocale du navigateur
          setUseClientSide(true);
          toast.success('Audio sera lu dans le navigateur', { id: 'audio-conversion' });
        } else if (result.audio) {
          setAudio(result.audio);
          setUseClientSide(false);
          toast.success('Audio prêt à être lu', { id: 'audio-conversion' });
        }
      } else {
        toast.error(result.error || 'Erreur lors de la conversion', { id: 'audio-conversion' });
      }
    } catch (error: unknown) {
      console.error('Erreur conversion audio:', error);
      toast.error('Erreur lors de la conversion', { id: 'audio-conversion' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (!audio && !useClientSide) {
      // Pas d'audio disponible, commencer la conversion
      await handleConvertToAudio();
      return;
    }

    if (useClientSide) {
      // Utiliser Web Speech API
      if (isPlaying) {
        ArticleAudioService.stopClientSideAudio();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        toast.loading('Lecture en cours...', { id: 'speech' });
        const result = await ArticleAudioService.generateClientSideAudio(articleText, `${language}-${language.toUpperCase()}`);
        setIsPlaying(false);
        if (result.success) {
          toast.success('Lecture terminée', { id: 'speech' });
        } else {
          toast.error('Erreur lors de la lecture', { id: 'speech' });
        }
      }
    } else if (audio && audio.audio_url) {
      // Utiliser audio HTML5
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (vol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (audio && audio.audio_url) {
      const a = document.createElement('a');
      a.href = audio.audio_url;
      a.download = `${articleTitle.replace(/[^a-z0-9]/gi, '_')}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Téléchargement démarré');
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-blue-600 p-2 rounded-full">
          <Volume2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">Écouter l'article</h4>
          <p className="text-sm text-gray-600">
            {audio?.status === 'ready' ? 'Audio disponible' : 'Convertir en audio'}
          </p>
        </div>
      </div>

      {/* Message d'information pour Web Speech */}
      {useClientSide && (
        <div className="mb-3 p-2 bg-blue-100 border border-blue-300 rounded text-sm text-blue-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Lecture via le navigateur (Web Speech API)</span>
        </div>
      )}

      {/* Lecteur audio HTML5 */}
      {audio && audio.audio_url && !useClientSide && (
        <audio
          ref={audioRef}
          src={audio.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={handleTimeUpdate}
        />
      )}

      {/* Contrôles */}
      <div className="space-y-3">
        {/* Barre de progression */}
        {audio && audio.audio_url && !useClientSide && duration > 0 && (
          <div className="space-y-1">
            <input type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
             aria-label="Range" />
            <div className="flex justify-between text-xs text-gray-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Boutons de contrôle */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePlayPause}
            disabled={isLoading}
            className="flex-1"
            variant={isPlaying ? 'outline' : 'default'}
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Chargement...
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                {audio ? 'Lire' : 'Générer & Lire'}
              </>
            )}
          </Button>

          {/* Contrôle du volume */}
          {audio && audio.audio_url && !useClientSide && (
            <>
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title={isMuted ? 'Activer le son' : 'Couper le son'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-gray-600" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gray-600" />
                )}
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <input type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 aria-label="Range" />
              </div>

              {/* Bouton de téléchargement */}
              <button aria-label="Download"
                onClick={handleDownload}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Télécharger l'audio"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Statut de traitement */}
      {audio && audio.status === 'processing' && (
        <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800 flex items-center gap-2">
          <Loader className="w-4 h-4 animate-spin" />
          <span>Conversion en cours...</span>
        </div>
      )}

      {audio && audio.status === 'error' && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800">
          Erreur: {audio.error_message || 'Impossible de générer l\'audio'}
        </div>
      )}
    </div>
  );
}
