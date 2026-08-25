import { NavLink } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, MessageCircle, Salad, Settings as SettingsIcon, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/allenamenti', label: 'Allenamenti', icon: Dumbbell },
  { to: '/nutrizione', label: 'Nutrizione', icon: Salad },
  { to: '/progressi', label: 'Progressi', icon: TrendingUp },
  { to: '/coach', label: 'Coach AI', icon: MessageCircle },
  { to: '/impostazioni', label: 'Impostazioni', icon: SettingsIcon },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-card/40 px-3 py-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Dumbbell className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Wellness Home Coach</p>
          <p className="text-xs text-muted-foreground">Allenamento &amp; AI locale</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-lg bg-secondary/60 px-3 py-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Dati 100% locali</p>
        <p>SQLite locale + Ollama su questo computer. Nessun dato lascia il dispositivo.</p>
      </div>
    </aside>
  );
}
