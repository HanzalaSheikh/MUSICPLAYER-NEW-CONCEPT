import React, { useState, useMemo } from 'react';
import { Music, Search, FolderOpen, Loader2, Play, PlusCircle, Folder, ChevronLeft, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { Song } from '../types';

interface LibraryProps {
  songs: Song[];
  onPlaySong: (index: number) => void;
  currentSongId?: string;
  onScan: () => void;
  isScanning: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRenameFolder: (oldName: string, newName: string) => void;
}

const Library: React.FC<LibraryProps> = ({
  songs,
  onPlaySong,
  currentSongId,
  onScan,
  isScanning,
  searchQuery,
  setSearchQuery,
  onRenameFolder
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const folders = useMemo(() => {
    const groups: Record<string, Song[]> = {};
    songs.forEach(song => {
      const folder = song.folderName || 'Other';
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(song);
    });
    return groups;
  }, [songs]);

  const folderList = useMemo(() => Object.keys(folders).sort(), [folders]);

  const displayedSongs = useMemo(() => {
    let list = selectedFolder ? folders[selectedFolder] : songs;
    if (searchQuery) {
      list = list.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [selectedFolder, folders, songs, searchQuery]);

  // Find the global index of a song for onPlaySong
  const handlePlay = (songId: string) => {
    const globalIndex = songs.findIndex(s => s.id === songId);
    if (globalIndex !== -1) onPlaySong(globalIndex);
  };

  const startRename = (e: React.MouseEvent, folder: string) => {
    e.stopPropagation();
    setRenamingFolder(folder);
    setNewName(folder);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingFolder(null);
    setNewName('');
  };

  const submitRename = (e: React.MouseEvent, oldName: string) => {
    e.stopPropagation();
    if (newName.trim() && newName !== oldName) {
      onRenameFolder(oldName, newName.trim());
    }
    setRenamingFolder(null);
    setNewName('');
  };

  return (
    <div className="flex flex-col h-full">
      <header className="p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {selectedFolder && (
              <button
                onClick={() => setSelectedFolder(null)}
                className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-sky-400 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent truncate max-w-[200px]">
              {selectedFolder || 'Your Library'}
            </h1>
          </div>
          <button
            onClick={onScan}
            disabled={isScanning}
            className="flex items-center gap-2 text-xs font-semibold bg-sky-500 text-slate-950 px-4 py-2 rounded-full hover:bg-sky-400 transition-colors active:scale-95 disabled:opacity-50 shadow-lg shadow-sky-500/20"
          >
            {isScanning ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <PlusCircle size={16} />
            )}
            {isScanning ? 'Syncing...' : 'Import Folder'}
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500" />
          </div>
          <input
            type="text"
            placeholder={selectedFolder ? `Search in ${selectedFolder}...` : "Search songs, artists..."}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-400 font-medium">
            {selectedFolder ? `${displayedSongs.length} Songs` : `${folderList.length} Folders`}
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-20">
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 px-10 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center mb-6">
              <Music size={48} className="text-slate-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Music Found</h2>
            <p className="text-sm text-slate-500 mb-8 max-w-xs">
              To start listening, give SonicFlow permission to access your local music folders.
            </p>
            <button
              onClick={onScan}
              disabled={isScanning}
              className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all"
            >
              {isScanning ? <Loader2 className="animate-spin" /> : <FolderOpen size={20} />}
              {isScanning ? 'Analyzing files...' : 'Select Music Folder'}
            </button>
          </div>
        ) : !selectedFolder && !searchQuery ? (
          /* Folder List View */
          <div className="grid grid-cols-1 gap-3">
            {folderList.map(folder => (
              <div
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 hover:bg-slate-800/60 hover:border-sky-500/30 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <Folder size={24} fill="currentColor" fillOpacity={0.2} />
                </div>
                <div className="flex-1 min-w-0">
                  {renamingFolder === folder ? (
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        type="text"
                        className="bg-slate-800 border border-sky-500 rounded px-2 py-1 text-sm w-full focus:outline-none"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') submitRename(e as any, folder);
                          if (e.key === 'Escape') cancelRename(e as any);
                        }}
                      />
                      <button onClick={e => submitRename(e, folder)} className="p-1 text-green-500 hover:bg-green-500/10 rounded">
                        <Check size={16} />
                      </button>
                      <button onClick={cancelRename} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-sm font-semibold truncate text-slate-100">{folder}</h4>
                      <p className="text-xs text-slate-500">{folders[folder].length} songs</p>
                    </>
                  )}
                </div>
                {renamingFolder !== folder && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => startRename(e, folder)}
                      className="p-2 text-slate-500 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <ChevronRight size={18} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Song List View (Inside Folder or Search) */
          <div className="space-y-1">
            {displayedSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => handlePlay(song.id)}
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
