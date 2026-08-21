const fs = require('fs');
const file = 'src/pages/Assignment.tsx';
let content = fs.readFileSync(file, 'utf8');

const modalCode = `
      </div>

      {/* Assignment Modal overlay */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  Distribute Portfolio: <span className="text-primary">{assignModal.city}</span>
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-black uppercase tracking-widest text-destructive">
                    {assignModal.cases.length} Pending Cases
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Available for allocation</span>
                </div>
              </div>
              <button onClick={() => setAssignModal(null)} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-background">
              {/* Distribution Mode Tabs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { id: 'EQUAL', label: 'Equal Split', icon: Equal },
                  { id: 'CUSTOM', label: 'Custom Count', icon: BarChart3 },
                  { id: 'PERCENT', label: 'Percentage (%)', icon: PieChart },
                  { id: 'POS', label: 'POS Balance', icon: Scale },
                ].map(mode => (
                  <button 
                    key={mode.id}
                    onClick={() => setDistMode(mode.id as any)}
                    className={\`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all \${distMode === mode.id ? 'bg-primary/5 border-primary text-primary shadow-sm scale-[1.02]' : 'bg-card border-border text-muted-foreground hover:bg-muted'}\`}
                  >
                    <mode.icon className="h-6 w-6" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{mode.label}</span>
                  </button>
                ))}
              </div>

              {/* Mode Info Box */}
              <div className="mb-6 p-4 rounded-xl bg-info/5 border border-info/20 text-sm text-info/90 flex items-start gap-3 shadow-inner">
                <div className="shrink-0 mt-0.5"><Scale className="h-5 w-5" /></div>
                <p className="leading-relaxed font-medium">{DIST_INFO[distMode]}</p>
              </div>

              {/* Executives List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2"> 
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Select Agents & Values 
                  </label>
                </div>
                
                {selectedExecs.map((exec, idx) => (
                  <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-left-2">
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        value={exec.name}
                        onChange={(e) => {
                          const n = [...selectedExecs];
                          n[idx].name = e.target.value;
                          setSelectedExecs(n);
                        }}
                        placeholder="Agent Name..."
                        list="modal-exec-list"
                        className="w-full h-12 px-4 rounded-xl bg-card border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                      />
                    </div>
                    
                    {distMode === 'CUSTOM' && (
                      <div className="w-32 relative">
                        <input type="number" min="1" max={assignModal.cases.length} value={exec.val} placeholder="Count"
                          onChange={(e) => {
                            const n = [...selectedExecs]; n[idx].val = e.target.value; setSelectedExecs(n);
                          }}
                          className="w-full h-12 px-4 rounded-xl bg-card border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                        />
                      </div>
                    )}

                    {distMode === 'PERCENT' && (
                      <div className="w-32 relative flex items-center">
                        <input type="number" min="1" max="100" value={exec.val} placeholder="0"
                          onChange={(e) => {
                            const n = [...selectedExecs]; n[idx].val = e.target.value; setSelectedExecs(n);
                          }}
                          className="w-full h-12 px-4 pr-8 rounded-xl bg-card border border-border text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                        />
                        <span className="absolute right-3 text-muted-foreground font-bold">%</span>
                      </div>
                    )}
                    
                    {(distMode === 'EQUAL' || distMode === 'POS') && (
                      <div className="w-32 h-12 px-4 flex items-center justify-center bg-muted/50 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground border border-border">
                        Auto
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        const n = [...selectedExecs];
                        n.splice(idx, 1);
                        if (n.length === 0) n.push({ name: '', val: '' });
                        setSelectedExecs(n);
                      }}
                      className="shrink-0 p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setSelectedExecs([...selectedExecs, { name: '', val: '' }])}
                className="mt-6 flex items-center justify-center w-full sm:w-auto gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors bg-primary/5 border border-primary/20 px-6 py-3 rounded-xl hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" /> Add Another Agent
              </button>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 border-t border-border bg-muted/30 flex flex-wrap justify-end gap-3">
              <button 
                onClick={() => setAssignModal(null)}
                className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted transition-colors border border-transparent"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAssignment}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-md hover:bg-primary/90 transition-all hover:scale-[1.02]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Distribute & Save
              </button>
            </div>
          </div>
        </div>
      )}`;

content = content.replace(/<\/div>\s*<datalist id="modal-exec-list">/, modalCode + '\n\n      <datalist id="modal-exec-list">');

fs.writeFileSync(file, content);
