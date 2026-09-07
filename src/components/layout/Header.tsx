import { Link, useLocation } from 'react-router-dom';
import { Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold gradient-text">StoryMagic</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/">
            <Button
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate
            </Button>
          </Link>
          
          <Link to="/creations">
            <Button
              variant={location.pathname === '/creations' ? 'default' : 'ghost'}
              size="sm"
              className="gap-2"
            >
              <BookOpen className="w-4 h-4" />
              My Creations
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
