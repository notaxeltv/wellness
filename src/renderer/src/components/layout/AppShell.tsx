import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { OllamaStatusBadge } from './OllamaStatusBadge';

export function AppShell() {
  const oggi = new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <p className="text-sm capitalize text-muted-foreground">{oggi}</p>
          <OllamaStatusBadge />
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
