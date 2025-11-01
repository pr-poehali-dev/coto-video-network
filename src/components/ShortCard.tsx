import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface ShortCardProps {
  short: {
    id: string;
    title: string;
    thumbnail: string;
    channel: {
      name: string;
      avatar?: string;
    };
    likes: number;
    comments: number;
  };
}

export default function ShortCard({ short }: ShortCardProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="relative h-[600px] w-full max-w-[350px] rounded-xl overflow-hidden bg-muted group">
      <img
        src={short.thumbnail}
        alt={short.title}
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex items-end gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm mb-2 line-clamp-2">{short.title}</p>
            <p className="text-xs opacity-90">{short.channel.name}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full h-12 w-12 ${liked ? 'text-primary' : 'text-white'} hover:bg-white/20`}
              onClick={() => setLiked(!liked)}
            >
              <div className="flex flex-col items-center">
                <Icon name={liked ? 'ThumbsUp' : 'ThumbsUp'} size={24} />
                <span className="text-xs mt-1">{(short.likes + (liked ? 1 : 0)).toLocaleString('ru-RU')}</span>
              </div>
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 text-white hover:bg-white/20">
              <div className="flex flex-col items-center">
                <Icon name="MessageCircle" size={24} />
                <span className="text-xs mt-1">{short.comments.toLocaleString('ru-RU')}</span>
              </div>
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 text-white hover:bg-white/20">
              <Icon name="Share2" size={24} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
