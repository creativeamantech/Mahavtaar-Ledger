const fs = require('fs');
let code = fs.readFileSync('src/pages/BandExplorer.tsx', 'utf-8');

const hookStr = `
  useEffect(() => {
    const timer = setTimeout(() => {
      const mn = Number(tempMin) || 0;
      const mx = Number(tempMax) || 0;
      const finalMin = Math.min(mn, mx);
      const finalMax = Math.max(mn, mx);
      if (finalMin !== minPos || finalMax !== maxPos) {
        handleApply();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [tempMin, tempMax, minPos, maxPos]);
`;

code = code.replace(
    "  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'}>({ key: 'city_count', direction: 'desc' });",
    hookStr + "\n  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'}>({ key: 'city_count', direction: 'desc' });"
);

// We should also remove the "Apply Filter" button to make it truly seamless, or maybe leave it? The prompt says: "This will allow the slider to slide smoothly and without interruption." which implies it currently attempts to change the data immediately?
// Oh wait. `onValueChange` updates `tempMin` and `tempMax`. `tempMin` and `tempMax` updates trigger re-renders. 
// BUT maybe they were auto-applying in the slider's `onValueCommit`? No, we used `onValueChange` and updated `tempMin`/`tempMax`. `tempMin` and `tempMax` DO NOT trigger data recalculation, `minPos` and `maxPos` do (from the URL).
// Why did the user say "When a slider is slid, it attempts to change the data"?
// Oh! Does `tempMin` and `tempMax` being changed trigger anything heavy?
// The user said: "When a slider is slid, it attempts to change the data. Instead, the slider should finish sliding and then change the data after one second."

// Wait, let's remove the "Apply Filter" button since it auto-applies.
code = code.replace(
    /                    <button\s*onClick=\{handleApply\}\s*className="h-9 rounded-md bg-primary\/10 text-primary px-4 text-sm font-bold hover:bg-primary\/20 transition-colors shrink-0"\s*>\s*Apply Filter\s*<\/button>/,
    ""
);

fs.writeFileSync('src/pages/BandExplorer.tsx', code);
console.log("Patched BandExplorer to debounce slider and remove Apply button");
