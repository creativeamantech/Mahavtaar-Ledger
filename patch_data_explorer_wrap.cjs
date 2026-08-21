const fs = require('fs');
const file = 'src/pages/DataExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

// The problematic block:
// <div className="bg-card border border-border rounded-lg shadow-sm p-3 mb-4">
//   <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">

const oldBlock = `<div className="bg-card border border-border rounded-lg shadow-sm p-3 mb-4">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Paid Status</span>
            <select value={selectedPaidStatus} onChange={e => setSelectedPaidStatus(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              <option value="All">All Cases</option>
              <option value="Paid">Main Paid Only</option>
              <option value="Unpaid">Unpaid Only</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">State</span>
            <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">City</span>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              {availableCities.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Executive</span>
            <select value={selectedExecutive} onChange={e => setSelectedExecutive(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              {availableExecutives.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="ml-auto shrink-0">
            <button 
              onClick={() => {
                setSelectedState('All'); setSelectedCity('All'); setSelectedExecutive('All'); setSelectedPaidStatus('All'); setSearchQuery('');
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground font-semibold uppercase tracking-wider underline underline-offset-2 transition-colors"
            >
              Clear Secondary
            </button>
                    <div className="flex items-center ml-2 border-l border-border pl-4 gap-2">
                        <div className="flex items-center gap-1 mr-2">
              <button onClick={() => scrollTable('left')} className="h-8 px-2 border border-border rounded bg-muted/50 hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors" title="Scroll Left">
                <span className="text-[14px] leading-none">←</span>
              </button>
              <button onClick={() => scrollTable('right')} className="h-8 px-2 border border-border rounded bg-muted/50 hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors" title="Scroll Right">
                <span className="text-[14px] leading-none">→</span>
              </button>
            </div>
                        <div className="flex items-center gap-2 mr-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Jump</span>
              <select onChange={(e) => { if(e.target.value) jumpToColumn(e.target.value); e.target.value = ""; }} className="h-8 w-32 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
                <option value="">Select Col...</option>
                {(visibleExtraColumns || []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
                        <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all bg-card border border-border hover:bg-muted text-muted-foreground">
                  <Columns className="h-4 w-4" /> Columns
                </button>
              </PopoverTrigger>`;

const newBlock = `<div className="bg-card border border-border rounded-lg shadow-sm p-3 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Paid Status</span>
            <select value={selectedPaidStatus} onChange={e => setSelectedPaidStatus(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              <option value="All">All Cases</option>
              <option value="Paid">Main Paid Only</option>
              <option value="Unpaid">Unpaid Only</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">State</span>
            <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">City</span>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              {availableCities.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Executive</span>
            <select value={selectedExecutive} onChange={e => setSelectedExecutive(e.target.value)} className="h-8 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
              {availableExecutives.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0 lg:ml-auto">
            <button 
              onClick={() => {
                setSelectedState('All'); setSelectedCity('All'); setSelectedExecutive('All'); setSelectedPaidStatus('All'); setSearchQuery('');
              }}
              className="text-[11px] text-muted-foreground hover:text-foreground font-semibold uppercase tracking-wider underline underline-offset-2 transition-colors mr-2"
            >
              Clear Secondary
            </button>
            <div className="flex items-center border-l border-border pl-4 gap-2">
              <div className="flex items-center gap-1 mr-2">
                <button onClick={() => scrollTable('left')} className="h-8 px-2 border border-border rounded bg-muted/50 hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors" title="Scroll Left">
                  <span className="text-[14px] leading-none">←</span>
                </button>
                <button onClick={() => scrollTable('right')} className="h-8 px-2 border border-border rounded bg-muted/50 hover:bg-muted text-muted-foreground flex items-center justify-center transition-colors" title="Scroll Right">
                  <span className="text-[14px] leading-none">→</span>
                </button>
              </div>
              <div className="flex items-center gap-2 mr-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Jump</span>
                <select onChange={(e) => { if(e.target.value) jumpToColumn(e.target.value); e.target.value = ""; }} className="h-8 w-24 sm:w-32 rounded bg-muted/50 border border-border px-2 text-xs font-medium outline-none focus:border-primary">
                  <option value="">Select Col...</option>
                  {(visibleExtraColumns || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all bg-card border border-border hover:bg-muted text-muted-foreground">
                    <Columns className="h-4 w-4" /> Columns
                  </button>
                </PopoverTrigger>`;

if (content.includes('className="flex items-center gap-4 overflow-x-auto no-scrollbar"')) {
  content = content.replace(oldBlock, newBlock);
}

fs.writeFileSync(file, content);
