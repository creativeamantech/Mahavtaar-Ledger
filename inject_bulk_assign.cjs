const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// The place to inject the UI is right above the table container:
// <div className="bg-card border border-border rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
const tableContainer = '<div className="bg-card border border-border rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">';

const injectedUI = `
        {/* Saved Views Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
           {savedViews.map((view, i) => (
              <div key={i} className="flex items-center bg-muted/30 border border-border rounded-md px-2 py-1 gap-2">
                 <button className="text-xs font-bold text-foreground hover:text-primary truncate max-w-[120px]" title={view.name} onClick={() => {
                    if (view.selectedState) setSelectedState(view.selectedState);
                    if (view.selectedCity) setSelectedCity(view.selectedCity);
                    if (view.selectedBucket) setSelectedBucket(view.selectedBucket);
                    if (view.selectedExecutive) setSelectedExecutive(view.selectedExecutive);
                    if (view.selectedAllocation) setSelectedAllocation(view.selectedAllocation);
                    if (view.selectedPaidStatus) setSelectedPaidStatus(view.selectedPaidStatus);
                    if (view.minPos) setMinPos(view.minPos);
                    if (view.maxPos) setMaxPos(view.maxPos);
                    if (view.activeCustomFilters) setActiveCustomFilters(view.activeCustomFilters);
                    if (view.customFilterValues) setCustomFilterValues(view.customFilterValues);
                    if (view.sortConfig) setSortConfig(view.sortConfig);
                 }}>
                    {view.name}
                 </button>
                 <button className="text-muted-foreground hover:text-destructive" onClick={() => {
                    const next = [...savedViews];
                    next.splice(i, 1);
                    setSavedViews(next);
                    localStorage.setItem('dataExplorerSavedViews', JSON.stringify(next));
                 }}>
                    <X className="h-3 w-3" />
                 </button>
              </div>
           ))}
           <button className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 border border-dashed border-border rounded-md px-2 py-1" onClick={() => {
              const name = window.prompt("Enter a name for this saved view:");
              if (!name) return;
              const newView = {
                 name,
                 selectedState, selectedCity, selectedBucket, selectedExecutive,
                 selectedAllocation, selectedPaidStatus, minPos, maxPos,
                 activeCustomFilters, customFilterValues, sortConfig
              };
              const next = [...savedViews, newView];
              setSavedViews(next);
              localStorage.setItem('dataExplorerSavedViews', JSON.stringify(next));
           }}>
              <Save className="h-3 w-3" /> Save Current View
           </button>
        </div>

        {selectedCases.size > 0 && (
          <div className="bg-primary/5 border border-primary/20 p-3 mb-4 rounded-xl flex flex-wrap items-center gap-3 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" />
              {selectedCases.size} cases selected
            </div>
            <div className="h-6 w-px bg-primary/20 mx-2"></div>
            <select 
              className="h-9 px-3 rounded-md border border-border bg-card text-sm outline-none focus:border-primary"
              value={bulkAssignExec}
              onChange={e => setBulkAssignExec(e.target.value)}
            >
              <option value="">-- Select Executive --</option>
              {allExecutives.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-md hover:bg-primary/90 disabled:opacity-50"
              disabled={!bulkAssignExec}
              onClick={async () => {
                 const updates = Array.from(selectedCases).map(id => ({ agreementid: id, field: 'executive_name', value: bulkAssignExec }));
                 await bulkUpdateRecords(updates, authUser?.name || "System");
                 setSelectedCases(new Set());
                 setBulkAssignExec('');
              }}
            >
              Assign Selected
            </button>
            <button 
              className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setSelectedCases(new Set())}
            >
              Clear Selection
            </button>
          </div>
        )}
        
`;

content = content.replace(tableContainer, injectedUI + tableContainer);
fs.writeFileSync(file, content, 'utf8');
console.log('Injected Bulk Assign & Saved Views UI');
