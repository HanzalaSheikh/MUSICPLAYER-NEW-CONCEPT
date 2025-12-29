
import React from 'react';
import { Music, Search, FolderOpen, RefreshCcw, Loader2, Play } from 'lucide-react';
import { Song } from '../types';

interface LibraryProps {
  songs: Song[];
  onPlaySong: (index: number) => void;
  currentSongId?: string;
  onScan: () => void;
  isScanning: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const Library: React.FC<LibraryProps> = ({ 
  songs, 
  onPlaySong, 
  currentSongId, 
  onScan, 
  isScanning, 
  searchQuery, 
  setSearchQuery 
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="p-6 pb-2">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Your Library</h1>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500" />
          </div>
          <input 
            type="text"
            placeholder="Search songs, artists..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-400 font-medium">
            {songs.length} {songs.length === 1 ? 'Song' : 'Songs'} found
          </span>
          <button 
            onClick={onScan}
            disabled={isScanning}
            className="flex items-center gap-2 text-xs font-semibold bg-slate-900 border border-slate-800 px-4 py-2 rounded-full hover:bg-slate-800 transition-colors active:scale-95 disabled:opacity-50"
          >
            {isScanning ? (
              <Loader2 size={16} className="animate-spin text-sky-400" />
            ) : (
              <FolderOpen size={16} className="text-sky-400" />
            )}
            {isScanning ? 'Scanning...' : 'Add Music'}
          </button>
        </div>
      </header>

      {/* Song List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-20">
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-60 px-10 text-center mt-10">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center mb-4">
              <Music size={40} />
            </div>
            <p className="text-sm font-medium mb-1">Your library is empty</p>
            <p className="text-xs">Select a folder containing MP3 files to start listening offline.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {songs.map((song, index) => (
              <div 
                key={song.id}
                onClick={() => onPlaySong(index)}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer group hover:bg-slate-900/50 ${currentSongId === song.id ? 'bg-sky-500/10' : ''}`}
              >
                <div className="relative w-12 h-12 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 shadow-sm transition-transform group-active:scale-90">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} className="w-full h-full object-cover" alt="cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music size={20} className="text-slate-500" />
                    </div>
                  )}
                  {currentSongId === song.id && (
                    <div className="absolute inset-0 bg-sky-500/30 flex items-center justify-center backdrop-blur-[2px]">
                       <div className="flex gap-0.5 items-end h-3">
                          <div className="w-0.5 bg-white animate-[bounce_0.6s_infinite] h-full"></div>
                          <div className="w-0.5 bg-white animate-[bounce_0.8s_infinite] h-2"></div>
                          <div className="w-0.5 bg-white animate-[bounce_0.7s_infinite] h-3"></div>
                       </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-semibold truncate ${currentSongId === song.id ? 'text-sky-400' : 'text-slate-100'}`}>
                    {song.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={14} className="text-sky-400 fill-sky-400" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
