const fs = require('fs');

let headerCode = fs.readFileSync('src/components/layout/DesktopHeader.tsx', 'utf-8');

headerCode = headerCode.replace(
  `import { useLocation } from 'react-router-dom';`,
  `import { useLocation, useNavigate } from 'react-router-dom';`
);

headerCode = headerCode.replace(
  `import { useMemo } from 'react';`,
  `import { useMemo, useState, useRef, useEffect } from 'react';`
);

const stateAndLogic = `
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    
    const matches = [];
    for (const r of records || []) {
      const name = String(r.customer_name || r.CUSTOMERNAME || r['Customer Name'] || r.CUSTOMER_NAME || '').toLowerCase();
      const id = String(r.agreementid || r.agreement_no || r.AGREEMENTNO || r.AGREEMENTID || '').toLowerCase();
      
      if (name.includes(q) || id.includes(q)) {
        matches.push(r);
        if (matches.length >= 8) break; // Limit to 8 results for performance
      }
    }
    return matches;
  }, [searchQuery, records]);

  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearchFocused(false);
      navigate('/explorer?q=' + encodeURIComponent(searchQuery.trim()));
      setSearchQuery('');
    }
  };
`;

headerCode = headerCode.replace(
  `  const { records, globalBucket, setGlobalBucket } = useData();`,
  `  const { records, globalBucket, setGlobalBucket } = useData();\n${stateAndLogic}`
);

const searchInputHtml = `
        <div className="relative" ref={searchContainerRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search universally (Press Enter)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={handleSearchSubmit}
            className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all w-[300px]"
          />
          
          {isSearchFocused && searchQuery.length >= 2 && (
            <div className="absolute top-full mt-2 w-[400px] bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden right-0 md:right-auto md:left-0">
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
`;

// Replace the old div structure
const searchInputOld = `<div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search universally..." 
            className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all w-64"
          />
        </div>`;

headerCode = headerCode.replace(searchInputOld, searchInputHtml);

fs.writeFileSync('src/components/layout/DesktopHeader.tsx', headerCode);
console.log('DesktopHeader updated');
