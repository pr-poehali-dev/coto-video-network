import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnail: string;
    channel: {
      name: string;
      avatar?: string;
    };
    views: number;
    createdAt: Date;
    duration: string;
  };
  onClick?: () => void;
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/watch/${video.id}`);
    }
  };

  return (
    <div className="cursor-pointer group" onClick={handleClick}>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
      </div>

      <div className="flex gap-3">
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage src={video.channel.avatar} />
          <AvatarFallback>{video.channel.name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <p className="text-xs text-muted-foreground">{video.channel.name}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{video.views.toLocaleString('ru-RU')} просмотров</span>
            <span>•</span>
            <span>{formatDistanceToNow(video.createdAt, { addSuffix: true, locale: ru })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}