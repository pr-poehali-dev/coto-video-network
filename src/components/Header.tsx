import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface HeaderProps {
  onSearch?: (query: string) => void;
  currentUser?: { name: string; avatar?: string } | null;
  onAuthClick?: () => void;
}

export default function Header({ onSearch, currentUser, onAuthClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-50 flex items-center px-4 gap-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Icon name="Menu" size={24} />
        </Button>
        <div className="flex items-center gap-2">
          <Icon name="Play" size={32} className="text-primary" />
          <span className="text-xl font-bold hidden sm:inline">CotoVideo</span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto flex items-center gap-2">
        <div className="flex-1 flex items-center bg-muted rounded-full border border-border overflow-hidden">
          <Input
            type="text"
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
          />
          <Button type="submit" variant="ghost" size="icon" className="rounded-none border-l">
            <Icon name="Search" size={20} />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
          <Icon name="Mic" size={20} />
        </Button>
      </form>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Icon name="Video" size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Icon name="Bell" size={20} />
        </Button>
        {currentUser ? (
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>{currentUser.name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        ) : (
          <Button onClick={onAuthClick} variant="outline" className="rounded-full" size="sm">
            <Icon name="User" size={16} className="mr-2" />
            Войти
          </Button>
        )}
      </div>
    </header>
  );
}
