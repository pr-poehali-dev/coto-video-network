import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { VideoCard } from '@/components/VideoCard';

interface Video {
  id: number;
  title: string;
  video_url: string;
  thumbnail_url: string;
  channel_name: string;
  channel_avatar: string;
  views: number;
  likes_count: number;
  created_at: string;
  duration: string;
  video_type: string;
}

export default function Watch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    loadVideo();
    loadRecommendations();
  }, [id]);

  const loadVideo = async () => {
    try {
      const data = await api.getVideo(Number(id));
      setVideo(data.video);
    } catch (error) {
      console.error('Failed to load video');
    }
  };

  const loadRecommendations = async () => {
    try {
      const data = await api.getVideos('videos');
      setRecommendations(data.videos.slice(0, 10));
    } catch (error) {
      console.error('Failed to load recommendations');
    }
  };

  const handleLike = async () => {
    if (!video) return;
    try {
      await api.likeVideo(video.id);
      setLiked(!liked);
      setVideo({
        ...video,
        likes_count: liked ? video.likes_count - 1 : video.likes_count + 1
      });
    } catch (error) {
      console.error('Failed to like video');
    }
  };

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Загрузка видео...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden aspect-video mb-4">
              <video 
                src={video.video_url} 
                controls 
                autoPlay
                className="w-full h-full"
                poster={video.thumbnail_url}
              >
                Ваш браузер не поддерживает видео
              </video>
            </div>

            <h1 className="text-2xl font-bold mb-4">{video.title}</h1>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <img 
                  src={video.channel_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${video.channel_name}`} 
                  alt={video.channel_name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">{video.channel_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {video.views.toLocaleString('ru-RU')} просмотров
                  </p>
                </div>
                <Button 
                  onClick={() => setSubscribed(!subscribed)}
                  variant={subscribed ? "secondary" : "default"}
                >
                  {subscribed ? 'Вы подписаны' : 'Подписаться'}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={handleLike}
                  className="flex items-center gap-2"
                >
                  <Icon name={liked ? "ThumbsUp" : "ThumbsUp"} size={20} />
                  {video.likes_count.toLocaleString('ru-RU')}
                </Button>
                <Button variant="secondary">
                  <Icon name="Share2" size={20} />
                </Button>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                Опубликовано {new Date(video.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Рекомендации</h2>
            {recommendations.map((rec) => (
              <div 
                key={rec.id} 
                onClick={() => navigate(`/watch/${rec.id}`)}
                className="cursor-pointer"
              >
                <div className="flex gap-2 mb-4">
                  <img 
                    src={rec.thumbnail_url} 
                    alt={rec.title}
                    className="w-40 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold line-clamp-2 text-sm mb-1">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{rec.channel_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {rec.views.toLocaleString('ru-RU')} просмотров
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
