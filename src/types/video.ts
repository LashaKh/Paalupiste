export interface VideoProject {
  id: string;
  title: string;
  duration: number;
  clips: VideoClip[];
  audioTracks: AudioTrack[];
  textOverlays: TextOverlay[];
  effects: Effect[];
  exportSettings: ExportSettings;
}

export interface VideoClip {
  id: string;
  name: string;
  source: string;
  duration: number;
  trim?: {
    start: number;
    end: number;
  };
  speed: number;
  volume: number;
  filters: VideoFilters;
  transform?: VideoTransform;
  selected?: boolean;
}

export interface VideoFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  customFilter?: string;
  filterIntensity?: number;
}

export interface VideoTransform {
  rotate: number;
  scaleX: number;
  scaleY: number;
  cropTop: number;
  cropRight: number;
  cropBottom: number;
  cropLeft: number;
}

export interface AudioTrack {
  id: string;
  name: string;
  type: 'music' | 'voiceover' | 'original';
  url: string;
  volume: number;
  startTime: number;
  endTime: number;
  selected: boolean;
}

export interface TextOverlay {
  id: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  position: { x: number; y: number };
  startTime: number;
  endTime: number;
  animation: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface Effect {
  id: string;
  type: string;
  parameters: Record<string, any>;
  startTime: number;
  endTime: number;
}

export interface ExportSettings {
  resolution: '4K' | '1080p' | '720p' | '480p';
  format: 'mp4' | 'mov' | 'webm' | 'gif';
  quality: 'high' | 'medium' | 'low';
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16';
  compression: number;
  fps: number;
}