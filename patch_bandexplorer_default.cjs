const fs = require('fs');
let code = fs.readFileSync('src/pages/BandExplorer.tsx', 'utf-8');

code = code.replace(
    "const maxPos = searchParams.has('maxPos') ? Number(searchParams.get('maxPos')) : 5000;",
    "const maxPos = searchParams.has('maxPos') ? Number(searchParams.get('maxPos')) : absoluteMaxPos;"
);

// We need to also ensure that if the URL didn't have maxPos and we just loaded, tempMax reflects absoluteMaxPos
code = code.replace(
    "const [tempMax, setTempMax] = useState<string>(String(maxPos));",
    "const [tempMax, setTempMax] = useState<string>(String(searchParams.has('maxPos') ? maxPos : absoluteMaxPos));"
);

fs.writeFileSync('src/pages/BandExplorer.tsx', code);
console.log("Patched default maxPos");
