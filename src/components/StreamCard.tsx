import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface StreamCardProps {
  stream: {
    id: number;
    title: string;
    channel_name: string;
    channel_avatar?: string;
    viewers_count: number;
    thumbnail_url?: string;
  };
  onClick?: () => void;
}

export default function StreamCard({ stream, onClick }: StreamCardProps) {
  return (
    <div className="cursor-pointer group" onClick={onClick}>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3">
        <img
          src={stream.thumbnail_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500'}
          alt={stream.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        
        <div className="absolute top-2 left-2">
          <Badge className="bg-primary text-white font-bold px-2 py-1 flex items-center gap-1.5">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            ЭФИР
          </Badge>
        </div>

        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Icon name="Eye" size={12} />
          {stream.viewers_count.toLocaleString('ru-RU')}
        </div>
      </div>

      <div className="flex gap-3">
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage src={stream.channel_avatar} />
          <AvatarFallback>{stream.channel_name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {stream.title}
          </h3>
          <p className="text-xs text-muted-foreground">{stream.channel_name}</p>
        </div>
      </div>
    </div>
  );
}
