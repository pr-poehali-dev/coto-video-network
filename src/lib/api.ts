const API_URLS = {
  auth: 'https://functions.poehali.dev/cbec4d45-e9c8-4241-baa0-4d59e14431b0',
  videos: 'https://functions.poehali.dev/e3b440ae-25d5-45f3-8352-5d63ae424474',
  upload: 'https://functions.poehali.dev/307ed6e2-cc59-4c7e-b4d1-6ddbb3dee3bf',
  streams: 'https://functions.poehali.dev/52c1c5ab-bed7-453b-9802-a8b13f44afb9',
};

export interface User {
  id: number;
  email: string;
  username: string;
  avatar_url?: string;
}

export interface Video {
  id: number;
  title: string;
  description?: string;
  thumbnail_url: string;
  video_url?: string;
  duration: string;
  views: number;
  is_short: boolean;
  created_at: string;
  channel_name: string;
  channel_avatar?: string;
  likes_count: number;
  comments_count: number;
}

export interface Stream {
  id: number;
  title: string;
  description?: string;
  stream_key: string;
  rtmp_url: string;
  is_live: boolean;
  viewers_count: number;
  channel_name: string;
  channel_avatar?: string;
  started_at: string;
}

export const api = {
  async register(email: string, password: string, username?: string) {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', email, password, username }),
    });
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    });
    return response.json();
  },

  async getVideos(type: 'all' | 'shorts' = 'all'): Promise<{ videos: Video[] }> {
    const url = type === 'shorts' 
      ? `${API_URLS.videos}?type=shorts`
      : API_URLS.videos;
    const response = await fetch(url);
    return response.json();
  },

  async likeVideo(videoId: number, userId?: number) {
    const response = await fetch(API_URLS.videos, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'like', video_id: videoId, user_id: userId || 1 }),
    });
    return response.json();
  },

  async recordView(videoId: number, userId: number) {
    const response = await fetch(API_URLS.videos, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'view', video_id: videoId, user_id: userId }),
    });
    return response.json();
  },

  async uploadVideo(userId: number, title: string, description: string, thumbnailUrl: string, videoUrl: string, duration: string, isShort: boolean = false) {
    const response = await fetch(API_URLS.upload, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        title,
        description,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        duration,
        is_short: isShort,
      }),
    });
    return response.json();
  },

  async getStreams(): Promise<{ streams: Stream[] }> {
    const response = await fetch(API_URLS.streams);
    return response.json();
  },

  async startStream(userId: number, title: string, description?: string) {
    const response = await fetch(API_URLS.streams, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start', user_id: userId, title, description }),
    });
    return response.json();
  },

  async stopStream(streamId: number) {
    const response = await fetch(API_URLS.streams, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop', stream_id: streamId }),
    });
    return response.json();
  },

  async joinStream(streamId: number, userId: number) {
    const response = await fetch(API_URLS.streams, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', stream_id: streamId, user_id: userId }),
    });
    return response.json();
  },

  async getVideo(videoId: number): Promise<{ video: Video }> {
    const response = await fetch(`${API_URLS.videos}?id=${videoId}`);
    return response.json();
  },

  async uploadShort(userId: number, title: string, videoFile: File, thumbnailFile?: File) {
    const videoBase64 = await this.fileToBase64(videoFile);
    const thumbnailBase64 = thumbnailFile ? await this.fileToBase64(thumbnailFile) : null;

    const response = await fetch(API_URLS.upload, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': String(userId),
      },
      body: JSON.stringify({
        title,
        video: videoBase64,
        thumbnail: thumbnailBase64,
      }),
    });
    return response.json();
  },

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};