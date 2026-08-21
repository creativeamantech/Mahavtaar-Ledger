import { useLocation, useNavigate } from 'react-router-dom';
import { Undo2, Redo2, ChevronLeft, ChevronRight, Menu, Search, UserCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../ThemeToggle';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/exec-dashboard': 'Exec Dashboard',
  '/exec-team-perf': 'Team Overall Perf',
  '/data-entry': 'Data Entry',
  '/explorer': 'Explorer',
  '/assignment': 'Allocation',
  '/city-pivot': 'City Pivot',
  '/team-pivot': 'Team Pivot',
  '/band-explorer': 'Bands',
  '/settings': 'Settings',
  '/audit': 'Audit Log',
};

export function MobileHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const { records, globalBucket, setGlobalBucket, undo, redo, canUndo, canRedo } = useData();
  const isExplorer = location.pathname === '/explorer';

  const availableBuckets = useMemo(() => {
    const bkts = new Set<string>();
    (records || []).forEach((r: any) => {
      if (r.bom_bkt) bkts.add(String(r.bom_bkt).trim().toUpperCase());
    });
    return Array.from(bkts).sort();
  }, [records]);

  const title = PAGE_TITLES[location.pathname] || 'CRM';

  return (
    <div className="sticky top-0 z-40 flex flex-col border-b border-border bg-card/95 backdrop-blur md:hidden shadow-sm">
      <div className="flex h-14 items-center justify-between px-3">
        {/* Navigation & Undo/Redo Group */}
        <div className="flex items-center gap-0.5 bg-muted/40 p-1 rounded-lg border border-border/50">
          <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground" title="Go Back">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => navigate(1)} className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground" title="Go Forward">
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <div className="w-px h-3 bg-border/80 mx-0.5"></div>
          
          <button onClick={undo} disabled={!canUndo} className={`p-1.5 rounded-md transition-colors ${canUndo ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground/30'}`} title="Undo Action">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={redo} disabled={!canRedo} className={`p-1.5 rounded-md transition-colors ${canRedo ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground/30'}`} title="Redo Action">
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-center flex-1 mx-2">
          <h1 className="font-heading text-sm font-bold tracking-wider text-foreground truncate">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="p-1 hover:bg-muted rounded-full transition-colors text-primary" title="User Profile">
            <UserCircle className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Bucket Filter */}
      {availableBuckets.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-1.5 border-t border-border/30 bg-muted/10">
          <div className="flex bg-muted/30 p-1 rounded-lg border border-border w-max">
            <button
              onClick={() => setGlobalBucket('ALL')}
              className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${globalBucket === 'ALL' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:bg-muted'}`}
            >
              All Buckets
            </button>
            {availableBuckets.map(b => (
              <button
                key={b}
                onClick={() => setGlobalBucket(b)}
                className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${globalBucket === b ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              >
                Bucket {b}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
