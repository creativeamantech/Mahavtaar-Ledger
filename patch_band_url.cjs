const fs = require('fs');
let code = fs.readFileSync('src/pages/BandExplorer.tsx', 'utf-8');

// Replace standard useState for POS ranges with URL search params
code = code.replace(
    "import React, { useState, useMemo } from 'react';",
    "import React, { useState, useMemo, useEffect } from 'react';\nimport { useSearchParams } from 'react-router-dom';"
);

code = code.replace(
    "  const [minPos, setMinPos] = useState<number>(0);\n  const [maxPos, setMaxPos] = useState<number>(5000);",
    `  const [searchParams, setSearchParams] = useSearchParams();
  const minPos = Number(searchParams.get('minPos')) || 0;
  const maxPos = searchParams.has('maxPos') ? Number(searchParams.get('maxPos')) : 5000;`
);

code = code.replace(
    "  const [tempMin, setTempMin] = useState<string>('0');\n  const [tempMax, setTempMax] = useState<string>('5000');",
    `  const [tempMin, setTempMin] = useState<string>(String(minPos));
  const [tempMax, setTempMax] = useState<string>(String(maxPos));
  
  useEffect(() => {
    setTempMin(String(minPos));
    setTempMax(String(maxPos));
  }, [minPos, maxPos]);`
);

code = code.replace(
    `  const handleApply = () => {
    const mn = Number(tempMin) || 0;
    const mx = Number(tempMax) || 0;
    setMinPos(Math.min(mn, mx));
    setMaxPos(Math.max(mn, mx));
    if (mn > mx) {
        setTempMin(String(Math.min(mn, mx)));
        setTempMax(String(Math.max(mn, mx)));
    }
  };`,
    `  const handleApply = () => {
    const mn = Number(tempMin) || 0;
    const mx = Number(tempMax) || 0;
    const finalMin = Math.min(mn, mx);
    const finalMax = Math.max(mn, mx);
    if (mn > mx) {
        setTempMin(String(finalMin));
        setTempMax(String(finalMax));
    }
    const params = new URLSearchParams(searchParams);
    params.set('minPos', String(finalMin));
    params.set('maxPos', String(finalMax));
    setSearchParams(params, { replace: true });
  };`
);

fs.writeFileSync('src/pages/BandExplorer.tsx', code);
console.log("Patched BandExplorer URL state");
