import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { VIEWS } from '../../constants/permissions';
import {
  LayoutDashboard, FileText, Database, Building2, Users, Activity,
  Settings, ClipboardList, LogOut, ChevronLeft, ChevronRight,
  Hexagon, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

const NAV_GROUPS = [
  {
    title: 'Admin Hub',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', view: VIEWS.DASHBOARD },
      { label: 'Data Entry', icon: FileText, path: '/data-entry', view: VIEWS.DATA_ENTRY },
      { label: 'Assignment', icon: Users, path: '/assignment', view: VIEWS.ASSIGNMENT },
    ]
  },
  {
    title: 'Executive Hub',
    items: [
      { label: 'Exec Dashboard', icon: LayoutDashboard, path: '/exec-dashboard', view: VIEWS.EXEC_DASHBOARD },
      { label: 'Team Perf', icon: Activity, path: '/exec-team-perf', view: VIEWS.EXEC_TEAM_PERF },
    ]
  },
  {
    title: 'Data & Reports',
    items: [
      { label: 'Data Explorer', icon: Database, path: '/explorer', view: VIEWS.DATA_EXPLORER },
      { label: 'City Pivot', icon: Building2, path: '/city-pivot', view: VIEWS.CITY_PIVOT },
      { label: 'Team Pivot', icon: Users, path: '/team-pivot', view: VIEWS.TEAM_PIVOT },
      { label: 'Band Analysis', icon: Activity, path: '/band-explorer', view: VIEWS.CITY_TEAM_MATRIX },
    ]
  },
  {
    title: 'Settings',
    items: [
      { label: 'System Config', icon: Settings, path: '/settings', view: VIEWS.SETTINGS },
      { label: 'Audit Log', icon: ClipboardList, path: '/audit', view: VIEWS.AUDIT_LOG },
    ]
  }
];

export function AppSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: { collapsed: boolean, setCollapsed: (c: boolean | ((prev: boolean) => boolean)) => void, mobileOpen: boolean, setMobileOpen: (v: boolean) => void }) {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  return (
    <aside className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-card/95 backdrop-blur-md border-r border-border shadow-xl text-foreground transition-all duration-300 ease-in-out ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
      {/* Header / Logo */}
      <div className="flex h-[72px] shrink-0 items-center justify-center border-b border-border transition-all duration-300">
        <div className={`flex items-center gap-3 transition-all duration-300 ${collapsed ? 'px-0 justify-center' : 'px-6 w-full'}`}>
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center text-primary transition-transform hover:scale-110">
            <Hexagon className="absolute inset-0 h-full w-full fill-primary/20 stroke-primary stroke-[2]" />
            <span className="z-10 font-sans text-sm font-bold text-primary">M</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-in fade-in zoom-in duration-300">
              <h1 className="font-heading text-lg font-black tracking-tight text-foreground leading-tight">Mahavtaar CRM</h1>
              <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-primary/80">Enterprise</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin flex flex-col gap-6">
        {NAV_GROUPS.map((group, idx) => {
          const visibleItems = group.items.filter(item => hasPermission(item.view));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="px-3 flex flex-col gap-1">
              {!collapsed && (
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 animate-in fade-in duration-300">
                  {group.title}
                </div>
              )}
              {collapsed && (
                <div className="mx-auto mb-2 h-px w-6 bg-border" />
              )}
              {visibleItems.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Tooltip key={item.path} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 overflow-hidden ${
                          active 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {active && (
                          <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}
                        <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-200 ${active ? 'text-primary' : 'group-hover:scale-110'}`} />
                        <span className={`truncate transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                          {item.label}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" sideOffset={10} className="font-semibold text-xs">
                        {item.label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="mt-auto shrink-0 border-t border-border bg-muted/20 p-3 transition-all duration-300">
        {user && (
          <div className={`flex items-center gap-3 overflow-hidden rounded-xl bg-card p-2 border border-border shadow-sm transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold shadow-sm">
              {user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            
            <div className={`flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 flex-1'}`}>
              <div className="truncate text-sm font-bold text-foreground">{user.name}</div>
              <div className="truncate text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {user.role}
              </div>
            </div>
            
            {!collapsed && (
              <button
                onClick={logout}
                className="shrink-0 p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        
        {collapsed && user && (
          <button
            onClick={logout}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={`mt-2 flex w-full items-center gap-2 rounded-lg bg-card border border-border py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground ${collapsed ? 'justify-center' : 'justify-start px-3'}`}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /> <span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
