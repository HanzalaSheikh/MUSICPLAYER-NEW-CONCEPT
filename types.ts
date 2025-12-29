
export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  file: File;
  coverUrl?: string;
  url: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentSongIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: 'none' | 'one' | 'all';
  isShuffle: boolean;
}

export enum ViewType {
  LIBRARY = 'library',
  PLAYER = 'player',
  SETTINGS = 'settings'
}
