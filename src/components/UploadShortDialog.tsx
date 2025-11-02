import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UploadShortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  onSuccess: () => void;
}

export default function UploadShortDialog({ open, onOpenChange, userId, onSuccess }: UploadShortDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const { toast } = useToast();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast({ title: 'Выберите видео', variant: 'destructive' });
      return;
    }

    if (!title.trim()) {
      toast({ title: 'Введите название', variant: 'destructive' });
      return;
    }

    setUploading(true);

    try {
      const result = await api.uploadShort(userId, title, videoFile, thumbnailFile || undefined);
      
      if (result.error) {
        toast({ title: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Видео загружено!' });
        onOpenChange(false);
        setVideoFile(null);
        setThumbnailFile(null);
        setTitle('');
        onSuccess();
      }
    } catch (error) {
      toast({ title: 'Ошибка загрузки', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Загрузить Short</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название видео"
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="video">Видео файл (до 30 сек)</Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
            {videoFile && (
              <p className="text-sm text-muted-foreground mt-2">
                {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="thumbnail">Обложка (опционально)</Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            />
            {thumbnailFile && (
              <p className="text-sm text-muted-foreground mt-2">
                {thumbnailFile.name}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={uploading} className="flex-1">
              {uploading ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Загружаю...
                </>
              ) : (
                <>
                  <Icon name="Upload" size={20} className="mr-2" />
                  Загрузить
                </>
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
