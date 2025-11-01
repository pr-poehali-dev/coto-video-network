import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'home', label: 'Главная', icon: 'Home' },
  { id: 'shorts', label: 'Shorts', icon: 'Play' },
  { id: 'subscriptions', label: 'Подписки', icon: 'Folder' },
];

const libraryItems = [
  { id: 'history', label: 'История', icon: 'History' },
  { id: 'favorites', label: 'Избранное', icon: 'Star' },
  { id: 'upload', label: 'Загрузить', icon: 'Upload' },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="hidden lg:block fixed left-0 top-14 w-60 h-[calc(100vh-3.5rem)] bg-background border-r border-border overflow-y-auto">
      <nav className="p-3">
        <div className="space-y-1 mb-3">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-6 rounded-lg h-10',
                activeTab === item.id && 'bg-secondary font-medium'
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon name={item.icon as any} size={20} />
              {item.label}
            </Button>
          ))}
        </div>

        <div className="border-t border-border pt-3 mb-3">
          <h3 className="px-3 mb-2 text-sm font-medium text-muted-foreground">Библиотека</h3>
          <div className="space-y-1">
            {libraryItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-6 rounded-lg h-10',
                  activeTab === item.id && 'bg-secondary font-medium'
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon name={item.icon as any} size={20} />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
