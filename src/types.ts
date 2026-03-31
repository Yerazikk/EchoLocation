export interface CameraNode {
  id: string;
  name: string;
  x: number; // 0-100 percentage or coordinate
  y: number; // 0-100 percentage or coordinate
}

export interface TimelineState {
  currentTime: number; // in seconds
  duration: number; // in seconds
  isPlaying: boolean;
}

export interface AudioEvent {
  id: string;
  nodeId: string;
  label: string;
  timestamp: number;
  isGunfire?: boolean;
  expiresAt?: number;
  initialOffset?: number;
}
