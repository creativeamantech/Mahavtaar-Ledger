const fs = require('fs');
let code = fs.readFileSync('src/pages/BandExplorer.tsx', 'utf-8');

if (!code.includes('import { Slider } from')) {
    code = code.replace(
        "import { Link } from 'react-router-dom';",
        "import { Link } from 'react-router-dom';\nimport { Slider } from '../components/ui/slider';"
    );
}

// Calculate max bounds dynamically
if (!code.includes('const absoluteMaxPos')) {
    code = code.replace(
        "  const minPos = Number(searchParams.get('minPos')) || 0;",
        `  const absoluteMaxPos = useMemo(() => {
    let m = 50000;
    if (dataWithBands && dataWithBands.length > 0) {
      dataWithBands.forEach(r => {
        if (r._posVal > m) m = r._posVal;
      });
    }
    return Math.ceil(m / 5000) * 5000;
  }, [dataWithBands]);
  
  const minPos = Number(searchParams.get('minPos')) || 0;`
    );
}

// Replace the input section
const inputSectionMatch = `                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        value={tempMin}
                        onChange={(e) => setTempMin(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Min POS"
                        className="h-9 w-[100px] rounded-md bg-muted/50 border border-border px-3 text-sm font-medium outline-none focus:border-primary"
                    />
                    <span className="text-muted-foreground font-medium">-</span>
                    <input
                        type="number"
                        value={tempMax}
                        onChange={(e) => setTempMax(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Max POS"
                        className="h-9 w-[100px] rounded-md bg-muted/50 border border-border px-3 text-sm font-medium outline-none focus:border-primary"
                    />
                    <button
                        onClick={handleApply}
                        className="h-9 rounded-md bg-primary/10 text-primary px-4 text-sm font-bold hover:bg-primary/20 transition-colors"
                    >
                        Apply
                    </button>
                </div>`;

const sliderSection = `                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-[400px]">
                    <div className="flex items-center gap-2 w-full">
                        <span className="text-xs font-bold text-muted-foreground min-w-[50px] text-right">{fmtCur(Number(tempMin))}</span>
                        <Slider 
                            min={0} 
                            max={absoluteMaxPos} 
                            step={500}
                            value={[Number(tempMin) || 0, Number(tempMax) || absoluteMaxPos]} 
                            onValueChange={(vals) => {
                                setTempMin(String(vals[0]));
                                setTempMax(String(vals[1]));
                            }}
                            className="flex-1 min-w-[150px]"
                        />
                        <span className="text-xs font-bold text-muted-foreground min-w-[60px]">{fmtCur(Number(tempMax))}</span>
                    </div>
                    <button
                        onClick={handleApply}
                        className="h-9 rounded-md bg-primary/10 text-primary px-4 text-sm font-bold hover:bg-primary/20 transition-colors shrink-0"
                    >
                        Apply Filter
                    </button>
                </div>`;

if (code.includes(inputSectionMatch)) {
    code = code.replace(inputSectionMatch, sliderSection);
} else {
    // If exact match fails, let's do a more robust string replacement
    console.log("EXACT MATCH FAILED");
}

fs.writeFileSync('src/pages/BandExplorer.tsx', code);
console.log("Patched BandExplorer to use Slider");
