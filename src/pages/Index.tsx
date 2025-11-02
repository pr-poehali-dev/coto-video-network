import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import VideoCard from '@/components/VideoCard';
import ShortCard from '@/components/ShortCard';
import StreamCard from '@/components/StreamCard';
import UploadShortDialog from '@/components/UploadShortDialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, type Video, type User, type Stream } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showUploadShortDialog, setShowUploadShortDialog] = useState(false);
  const [showStreamDialog, setShowStreamDialog] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [shorts, setShorts] = useState<Video[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVideos();
    loadShorts();
    loadStreams();
    
    const savedUser = localStorage.getItem('cotovideo_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await api.getVideos('all');
      setVideos(data.videos);
    } catch (error) {
      toast({ title: 'Ошибка загрузки видео', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadShorts = async () => {
    try {
      const data = await api.getVideos('shorts');
      setShorts(data.videos);
    } catch (error) {
      console.error('Failed to load shorts');
    }
  };

  const loadStreams = async () => {
    try {
      const data = await api.getStreams();
      setStreams(data.streams);
    } catch (error) {
      console.error('Failed to load streams');
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await api.login(email, password);
      if (result.user) {
        setCurrentUser(result.user);
        localStorage.setItem('cotovideo_user', JSON.stringify(result.user));
        localStorage.setItem('cotovideo_token', result.token);
        setShowAuthDialog(false);
        toast({ title: 'Добро пожаловать!' });
      } else {
        toast({ title: result.error || 'Ошибка входа', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;

    try {
      const result = await api.register(email, password, username);
      if (result.user) {
        setCurrentUser(result.user);
        localStorage.setItem('cotovideo_user', JSON.stringify(result.user));
        localStorage.setItem('cotovideo_token', result.token);
        setShowAuthDialog(false);
        toast({ title: 'Регистрация успешна!' });
      }
    } catch (error) {
      toast({ title: 'Ошибка регистрации', variant: 'destructive' });
    }
  };

  const handleStartStream = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('stream-title') as string;
    const description = formData.get('stream-desc') as string;

    if (!currentUser) {
      toast({ title: 'Войдите чтобы начать трансляцию', variant: 'destructive' });
      return;
    }

    try {
      const result = await api.startStream(currentUser.id, title, description);
      if (result.success) {
        setIsStreaming(true);
        setShowStreamDialog(false);
        toast({ 
          title: 'Трансляция началась!',
          description: `Ключ потока: ${result.stream.stream_key}`,
        });
      }
    } catch (error) {
      toast({ title: 'Ошибка запуска трансляции', variant: 'destructive' });
    }
  };

  const handleStopStream = async () => {
    setIsStreaming(false);
    toast({ title: 'Трансляция завершена' });
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
            {isStreaming && (
              <div className="mb-6 p-6 bg-primary/10 border-2 border-primary rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full animate-ping" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Вы в эфире</h3>
                      <p className="text-sm text-muted-foreground">Трансляция идёт</p>
                    </div>
                  </div>
                  <Button onClick={handleStopStream} variant="destructive">
                    Завершить эфир
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <Icon name="Loader2" size={48} className="animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {videos.map((video) => (
                  <VideoCard 
                    key={video.id} 
                    video={{
                      id: String(video.id),
                      title: video.title,
                      thumbnail: video.thumbnail_url,
                      channel: { 
                        name: video.channel_name, 
                        avatar: video.channel_avatar 
                      },
                      views: video.views,
                      createdAt: new Date(video.created_at),
                      duration: video.duration,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'shorts' && (
          <div className="min-h-screen bg-black flex items-center justify-center snap-y snap-mandatory overflow-y-scroll">
            <div className="flex flex-col items-center gap-4 p-4">
              {shorts.map((short) => (
                <div key={short.id} className="snap-center">
                  <ShortCard 
                    short={{
                      id: String(short.id),
                      title: short.title,
                      thumbnail: short.thumbnail_url,
                      channel: { 
                        name: short.channel_name, 
                        avatar: short.channel_avatar 
                      },
                      likes: short.likes_count,
                      comments: short.comments_count,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Icon name="Radio" size={28} className="text-primary" />
              Прямые эфиры
            </h2>
            {streams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {streams.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="Radio" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Сейчас нет активных трансляций</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Подписки</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.slice(0, 2).map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={{
                    id: String(video.id),
                    title: video.title,
                    thumbnail: video.thumbnail_url,
                    channel: { name: video.channel_name, avatar: video.channel_avatar },
                    views: video.views,
                    createdAt: new Date(video.created_at),
                    duration: video.duration,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">История просмотров</h2>
            <div className="max-w-4xl">
              {videos.map((video) => (
                <div key={video.id} className="flex gap-4 mb-4 p-3 hover:bg-muted rounded-lg transition-colors">
                  <div className="relative w-48 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">{video.channel_name}</p>
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
              {videos.slice(0, 3).map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={{
                    id: String(video.id),
                    title: video.title,
                    thumbnail: video.thumbnail_url,
                    channel: { name: video.channel_name, avatar: video.channel_avatar },
                    views: video.views,
                    createdAt: new Date(video.created_at),
                    duration: video.duration,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Загрузить контент</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div 
                onClick={() => {
                  if (!currentUser) {
                    toast({ title: 'Войдите чтобы загрузить видео', variant: 'destructive' });
                    return;
                  }
                  setShowUploadShortDialog(true);
                }}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Icon name="Smartphone" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Загрузить Short</h3>
                <p className="text-sm text-muted-foreground">Вертикальное видео до 30 сек</p>
              </div>

              <div 
                onClick={() => setShowUploadDialog(true)}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Загрузить видео</h3>
                <p className="text-sm text-muted-foreground">Полноценное видео</p>
              </div>

              <div 
                onClick={() => setShowStreamDialog(true)}
                className="border-2 border-dashed border-primary/50 rounded-xl p-8 text-center cursor-pointer hover:bg-primary/5 transition-colors"
              >
                <Icon name="Radio" size={48} className="mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-medium mb-2">Начать трансляцию</h3>
                <p className="text-sm text-muted-foreground">Запустите прямой эфир</p>
              </div>
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
              <Input id="email" name="email" type="email" placeholder="your@email.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">
              Войти
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Загрузить видео</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Icon name="Upload" size={40} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">Перетащите файл или</p>
              <Button type="button">
                <Icon name="FolderOpen" size={16} className="mr-2" />
                Выбрать файл
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input id="title" placeholder="Название вашего видео" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" placeholder="Расскажите о видео..." rows={4} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Загрузить
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                Отмена
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <UploadShortDialog 
        open={showUploadShortDialog}
        onOpenChange={setShowUploadShortDialog}
        userId={currentUser?.id || 0}
        onSuccess={() => {
          loadShorts();
          toast({ title: 'Short успешно загружен!' });
        }}
      />

      <Dialog open={showStreamDialog} onOpenChange={setShowStreamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Начать трансляцию</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStartStream} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stream-title">Название трансляции</Label>
              <Input id="stream-title" name="stream-title" placeholder="Что вы будете транслировать?" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stream-desc">Описание</Label>
              <Textarea id="stream-desc" name="stream-desc" placeholder="Краткое описание эфира" rows={3} />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Настройте OBS Studio</p>
                  <p className="text-muted-foreground">
                    Используйте RTMP сервер для трансляции. Ключ потока будет сгенерирован после запуска.
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Icon name="Radio" size={16} className="mr-2" />
              Начать эфир
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}