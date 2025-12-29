
import React from 'react';
import { ChevronDown, SkipBack, SkipForward, Play, Pause, Repeat, Shuffle, Music, MoreHorizontal, Share2 } from 'lucide-react';
import { Song, PlaybackState } from '../types';

interface PlayerProps {
  song: Song;
  playback: PlaybackState;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onClose: () => void;
  setPlayback: React.Dispatch<React.SetStateAction<PlaybackState>>;
}

const Player: React.FC<PlayerProps> = ({
  song,
  playback,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  onClose,
  setPlayback
}) => {
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleShuffle = () => setPlayback(prev => ({ ...prev, isShuffle: !prev.isShuffle }));
  const toggleRepeat = () => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one'];
    const nextMode = modes[(modes.indexOf(playback.repeatMode) + 1) % modes.length];
    setPlayback(prev => ({ ...prev, repeatMode: nextMode }));
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col p-8 transition-all duration-300 animate-in slide-in-from-bottom">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div
          className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] blur-[100px] animate-[pulse_8s_infinite]"
          style={{ background: `radial-gradient(circle, ${playback.isPlaying ? '#38bdf8' : '#1e293b'} 0%, transparent 70%)` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between relative z-10 mb-8">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100"
        >
          <ChevronDown size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Now Playing</span>
          <span className="text-xs font-medium text-sky-400">{song.album || 'No Album'}</span>
        </div>
        <button className="p-2 text-slate-400">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Album Art Container */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <div className={`mx-auto w-full aspect-square max-w-[320px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${playback.isPlaying ? 'scale-100' : 'scale-90 opacity-80'}`}>
          {song.coverUrl ? (
            <img src={song.coverUrl} className="w-full h-full object-cover" alt="album art" />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <Music size={100} className="text-slate-700" />
            </div>
          )}
        </div>
      </div>

      {/* Info & Controls */}
      <div className="relative z-10 mt-8 mb-4">
        <div className="flex justify-between items-end mb-8">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-2xl font-bold truncate text-slate-100">{song.title}</h2>
            <p className="text-lg text-slate-400 font-medium truncate">{song.artist}</p>
          </div>
          <button className="p-3 bg-slate-900/50 rounded-2xl text-sky-400 active:scale-95 transition-transform">
            <Share2 size={20} />
          </button>
        </div>

        {/* Seek Bar */}
        <div className="space-y-2 mb-8">
          <div className="relative w-full h-6 flex items-center group">
            {/* Track Background */}
            <div className="absolute left-0 right-0 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              {/* Progress Fill */}
              <div
                className="h-full bg-sky-500 transition-all duration-100 ease-linear"
                style={{ width: `${(playback.currentTime / (playback.duration || 1)) * 100}%` }}
              />
            </div>

            {/* Thumb (Visual only, follows progress) */}
            <div
              className="absolute h-4 w-4 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform duration-200 pointer-events-none"
              style={{ left: `calc(${(playback.currentTime / (playback.duration || 1)) * 100}% - 8px)` }}
            />

            {/* Invisible Input for Interaction */}
            <input
              type="range"
              min="0"
              max={playback.duration || 100}
              step="0.1"
              value={playback.currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-500 tracking-wider">
            <span>{formatTime(playback.currentTime)}</span>
            <span>{formatTime(playback.duration)}</span>
          </div>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${playback.isShuffle ? 'text-sky-400' : 'text-slate-500'}`}
          >
            <Shuffle size={20} />
          </button>

          <div className="flex items-center gap-8">
            <button
              onClick={onPrev}
              className="p-3 text-slate-100 hover:text-sky-400 transition-colors active:scale-90"
            >
              <SkipBack size={32} fill="currentColor" />
            </button>

            <button
              onClick={onPlayPause}
              className="w-20 h-20 bg-sky-500 rounded-full flex items-center justify-center text-slate-950 shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
            >
              {playback.isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
            </button>

            <button
              onClick={onNext}
              className="p-3 text-slate-100 hover:text-sky-400 transition-colors active:scale-90"
            >
              <SkipForward size={32} fill="currentColor" />
            </button>
          </div>

          <button
            onClick={toggleRepeat}
            className={`p-2 transition-colors relative ${playback.repeatMode !== 'none' ? 'text-sky-400' : 'text-slate-500'}`}
          >
            <Repeat size={20} />
            {playback.repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-sky-500 text-slate-950 w-3 h-3 rounded-full flex items-center justify-center">1</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player;
