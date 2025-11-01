import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import VideoCard from '@/components/VideoCard';
import ShortCard from '@/components/ShortCard';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const mockVideos = [
  {
    id: '1',
    title: 'Как создать свой первый сайт на React за 30 минут',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
    channel: { name: 'Код Просто', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
    views: 125000,
    createdAt: new Date(Date.now() - 86400000 * 2),
    duration: '28:15',
  },
  {
    id: '2',
    title: 'TypeScript для начинающих: полный курс',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500',
    channel: { name: 'DevChannel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
    views: 89000,
    createdAt: new Date(Date.now() - 86400000 * 5),
    duration: '1:45:20',
  },
  {
    id: '3',
    title: 'Лучшие практики CSS Grid в 2024',
    thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=500',
    channel: { name: 'Веб Мастер', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
    views: 54000,
    createdAt: new Date(Date.now() - 86400000 * 7),
    duration: '15:42',
  },
  {
    id: '4',
    title: 'Создаём красивую анимацию с Framer Motion',
    thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500',
    channel: { name: 'Анимация PRO', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
    views: 42000,
    createdAt: new Date(Date.now() - 86400000 * 10),
    duration: '22:18',
  },
];

const mockShorts = [
  {
    id: 's1',
    title: 'Топ-5 хаков CSS за 60 секунд!',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
    channel: { name: 'Код Просто', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
    likes: 15000,
    comments: 320,
  },
  {
    id: 's2',
    title: 'React хук который ты не знал',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
    channel: { name: 'DevChannel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
    likes: 8900,
    comments: 156,
  },
  {
    id: 's3',
    title: 'Flexbox vs Grid - что выбрать?',
    thumbnail: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400',
    channel: { name: 'Веб Мастер', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
    likes: 12000,
    comments: 245,
  },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar?: string } | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({ name: 'Пользователь', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' });
    setShowAuthDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentUser={currentUser}
        onAuthClick={() => setShowAuthDialog(true)}
      />

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="lg:ml-60 pt-14 min-h-screen">
        {activeTab === 'home' && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'shorts' && (
          <div className="min-h-screen bg-black flex items-center justify-center snap-y snap-mandatory overflow-y-scroll">
            <div className="flex flex-col items-center gap-4 p-4">
              {mockShorts.map((short) => (
                <div key={short.id} className="snap-center">
                  <ShortCard short={short} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Подписки</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockVideos.slice(0, 2).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">История просмотров</h2>
            <div className="max-w-4xl">
              {mockVideos.map((video) => (
                <div key={video.id} className="flex gap-4 mb-4 p-3 hover:bg-muted rounded-lg transition-colors">
                  <div className="relative w-48 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">{video.channel.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {video.views.toLocaleString('ru-RU')} просмотров
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Избранное</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockVideos.slice(0, 3).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Загрузить видео</h2>
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
              <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Перетащите видео сюда</h3>
              <p className="text-sm text-muted-foreground mb-4">или выберите файл</p>
              <Button>
                <Icon name="FolderOpen" size={16} className="mr-2" />
                Выбрать файл
              </Button>
            </div>
          </div>
        )}
      </main>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Войти в CotoVideo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">
              Войти
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
