
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, Search, Library as LibraryIcon, Settings, ListMusic, ChevronDown, FolderOpen, RefreshCcw, Shuffle, Repeat } from 'lucide-react';
import { Song, PlaybackState, ViewType } from './types';
import Library from './components/Library';
import Player from './components/Player';

// Mock window typing for jsmediatags
declare global {
  interface Window {
    jsmediatags: any;
  }
}

const App: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [view, setView] = useState<ViewType>(ViewType.LIBRARY);
  const [playback, setPlayback] = useState<PlaybackState>({
    isPlaying: false,
    currentSongIndex: -1,
    currentTime: 0,
    duration: 0,
    volume: 1,
    repeatMode: 'all',
    isShuffle: false,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setPlayback(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handleLoadedMetadata = () => {
      setPlayback(prev => ({ ...prev, duration: audio.duration }));
    };

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Update Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator && playback.currentSongIndex !== -1) {
      const song = songs[playback.currentSongIndex];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album || 'Unknown Album',
        artwork: song.coverUrl ? [{ src: song.coverUrl, sizes: '512x512', type: 'image/png' }] : []
      });

      navigator.mediaSession.setActionHandler('play', () => handlePlayPause(true));
      navigator.mediaSession.setActionHandler('pause', () => handlePlayPause(false));
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);
    }
  }, [playback.currentSongIndex, songs]);

  const handleScanFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    const newSongs: Song[] = [];
    const jsmediatags = window.jsmediatags;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')) {
        const url = URL.createObjectURL(file);
        
        // Extract metadata
        const metadata: any = await new Promise((resolve) => {
          if (!jsmediatags) {
            resolve({ title: file.name, artist: 'Unknown Artist' });
            return;
          }
          jsmediatags.read(file, {
            onSuccess: (tag: any) => {
              const { title, artist, album, picture } = tag.tags;
              let coverUrl = undefined;
              if (picture) {
                const { data, format } = picture;
                let base64String = "";
                for (let j = 0; j < data.length; j++) {
                  base64String += String.fromCharCode(data[j]);
                }
                coverUrl = `data:${format};base64,${window.btoa(base64String)}`;
              }
              resolve({
                title: title || file.name.replace(/\.mp3$/i, ''),
                artist: artist || 'Unknown Artist',
                album: album || 'Unknown Album',
                coverUrl
              });
            },
            onError: () => {
              resolve({ title: file.name.replace(/\.mp3$/i, ''), artist: 'Unknown Artist' });
            }
          });
        });

        newSongs.push({
          id: Math.random().toString(36).substr(2, 9),
          title: metadata.title,
          artist: metadata.artist,
          album: metadata.album,
          duration: 0, // Will be updated on load
          file: file,
          url: url,
          coverUrl: metadata.coverUrl
        });
      }
    }

    setSongs(prev => [...prev, ...newSongs]);
    setIsScanning(false);
  };

  const playSong = (index: number) => {
    if (!audioRef.current || index < 0 || index >= songs.length) return;
    
    const song = songs[index];
    audioRef.current.src = song.url;
    audioRef.current.play();
    setPlayback(prev => ({
      ...prev,
      currentSongIndex: index,
      isPlaying: true,
      currentTime: 0
    }));
  };

  const handlePlayPause = (shouldPlay?: boolean) => {
    if (!audioRef.current || playback.currentSongIndex === -1) return;
    
    const playStatus = shouldPlay !== undefined ? shouldPlay : !playback.isPlaying;
    if (playStatus) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
    setPlayback(prev => ({ ...prev, isPlaying: playStatus }));
  };

  const handleNext = () => {
    let nextIndex = playback.currentSongIndex + 1;
    if (playback.isShuffle) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else if (nextIndex >= songs.length) {
      nextIndex = 0;
    }
    playSong(nextIndex);
  };

  const handlePrev = () => {
    let prevIndex = playback.currentSongIndex - 1;
    if (prevIndex < 0) {
      prevIndex = songs.length - 1;
    }
    playSong(prevIndex);
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayback(prev => ({ ...prev, currentTime: time }));
    }
  };

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Main View Area */}
      <div className="flex-1 relative overflow-hidden">
        {view === ViewType.LIBRARY && (
          <Library 
            songs={filteredSongs}
            onPlaySong={playSong}
            currentSongId={playback.currentSongIndex !== -1 ? songs[playback.currentSongIndex].id : undefined}
            onScan={() => document.getElementById('folder-input')?.click()}
            isScanning={isScanning}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        
        {view === ViewType.PLAYER && playback.currentSongIndex !== -1 && (
          <Player 
            song={songs[playback.currentSongIndex]}
            playback={playback}
            onPlayPause={() => handlePlayPause()}
            onNext={handleNext}
            onPrev={handlePrev}
            onSeek={handleSeek}
            onClose={() => setView(ViewType.LIBRARY)}
            setPlayback={setPlayback}
          />
        )}
      </div>

      {/* Mini Player / Bottom Navigation */}
      <div className="safe-bottom-padding glass-effect border-t border-slate-800/50 pb-2">
        {playback.currentSongIndex !== -1 && view !== ViewType.PLAYER && (
          <div 
            className="flex items-center px-4 py-3 gap-3 cursor-pointer active:bg-slate-800/50 transition-colors"
            onClick={() => setView(ViewType.PLAYER)}
          >
            <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 shadow-lg">
              {songs[playback.currentSongIndex].coverUrl ? (
                <img src={songs[playback.currentSongIndex].coverUrl} className="w-full h-full object-cover" alt="cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music size={24} className="text-slate-500" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate text-slate-100">{songs[playback.currentSongIndex].title}</h4>
              <p className="text-xs text-slate-400 truncate">{songs[playback.currentSongIndex].artist}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
                className="p-2 rounded-full hover:bg-slate-700/50"
              >
                {playback.isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="p-2 rounded-full hover:bg-slate-700/50"
              >
                <SkipForward size={24} />
              </button>
            </div>
          </div>
        )}

        <nav className="flex justify-around items-center pt-2 pb-safe">
          <button 
            onClick={() => setView(ViewType.LIBRARY)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${view === ViewType.LIBRARY ? 'text-sky-400' : 'text-slate-500'}`}
          >
            <LibraryIcon size={22} />
            <span className="text-[10px] font-medium">Library</span>
          </button>
          <button 
            onClick={() => playback.currentSongIndex !== -1 && setView(ViewType.PLAYER)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${view === ViewType.PLAYER ? 'text-sky-400' : 'text-slate-500'} ${playback.currentSongIndex === -1 ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <Music size={22} />
            <span className="text-[10px] font-medium">Player</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 p-2 text-slate-500 opacity-50 cursor-not-allowed"
          >
            <Settings size={22} />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </nav>
      </div>

      {/* Hidden Inputs */}
      <input 
        id="folder-input"
        type="file" 
        className="hidden" 
        multiple 
        accept="audio/mpeg" 
        onChange={handleScanFolder}
      />
    </div>
  );
};

export default App;
