const fs = require('fs');
let content = fs.readFileSync('src/components/layout/DesktopHeader.tsx', 'utf8');

const returnStatement = `  return (
    <header className="hidden md:flex sticky top-0 z-30 justify-between items-center px-4 h-14 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="flex items-center gap-3 w-1/4">
        {setCollapsed && (
          <button 
            type="button"
            onClick={() => setCollapsed(prev => !prev)}
            className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground shrink-0"
            title="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        
        {/* Navigation */}
        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/50">
          <button 
            type="button"
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate('/dashboard', { replace: true });
              }
            }} 
            className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground" 
            title="Go Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => navigate(1)} className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground" title="Go Forward">
            <ChevronRight className="h-4 w-4" />
          </button>          
        </div>
      </div>

      <div className="flex-1 flex justify-center px-4">
        <div className="relative" ref={searchContainerRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Quick Search or Agreements..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={handleSearchSubmit}
            className="pl-9 pr-14 h-9 bg-muted/50 border border-border rounded-full text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all w-[300px] lg:w-[400px]"
          />
          <kbd 
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
              document.dispatchEvent(event);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto inline-flex items-center gap-0.5 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground shadow-xs hover:bg-muted"
            title="Press Cmd+K or Ctrl+K"
          >
            ⌘K
          </kbd>
          
          {isSearchFocused && searchQuery.length >= 2 && (
            <div className="absolute top-full mt-2 w-full lg:w-[500px] bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden left-1/2 -translate-x-1/2">
              <div className="p-2 border-b border-border bg-muted/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Search Results</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">No matches found for "{searchQuery}"</div>
                ) : (
                  searchResults.map((r, i) => {
                    const id = r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '-';
                    const name = r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || '-';
                    const city = r.city || r.City || '-';
                    return (
                      <div 
                        key={i}
                        onClick={() => {
                          setIsSearchFocused(false);
                          navigate('/explorer?q=' + encodeURIComponent(id));
                          setSearchQuery('');
                        }}
                        className="p-3 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-bold text-primary truncate">{name}</span>
                          <span className="text-xs text-muted-foreground truncate">{id} &bull; {city}</span>
                        </div>
                        <div className="shrink-0 ml-3">
                          <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold uppercase text-muted-foreground">Bkt {r.bom_bkt}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {searchResults.length > 0 && (
                <div 
                  className="p-2 text-center text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer transition-colors border-t border-border"
                  onClick={() => {
                    setIsSearchFocused(false);
                    navigate('/explorer?q=' + encodeURIComponent(searchQuery.trim()));
                    setSearchQuery('');
                  }}
                >
                  View all results in Explorer
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-muted-foreground w-1/4 justify-end">
        {availableBuckets.length > 0 && (
          <div className="flex bg-muted/30 p-1 rounded-lg border border-border w-max mr-2 hidden lg:flex">
            <button
              type="button"
              onClick={() => setGlobalBucket('ALL')}
              className={\`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors \${globalBucket === 'ALL' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:bg-muted'}\`}
            >
              All Buckets
            </button>
            {availableBuckets.map(b => (
              <button
                type="button"
                key={b}
                onClick={() => setGlobalBucket(b)}
                className={\`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors \${globalBucket === b ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:bg-muted'}\`}
              >
                Bkt {b}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-1.5 border-l border-border pl-3">
          <SyncStatusIndicator />
          <ThemeToggle />
          {user?.role === 'EXECUTIVE' ? (
            <AgentNotifications />
          ) : (
            <button className="p-2 hover:bg-muted rounded-full transition-colors relative" title="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-card"></span>
            </button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-muted p-1 pr-2 rounded-full transition-colors ml-1 border border-border/50">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold shadow-sm">
                  {user?.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col items-start min-w-0 max-w-[120px]">
                  <span className="text-xs font-bold text-foreground truncate w-full text-left">{user?.name}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider truncate w-full text-left">{user?.role}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}`;

content = content.replace(/  return \([\s\S]*?\);\n}/, returnStatement + '\n}');

fs.writeFileSync('src/components/layout/DesktopHeader.tsx', content);
