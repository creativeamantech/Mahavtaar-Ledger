const fs = require('fs');
let code = fs.readFileSync('src/components/ui/slider.tsx', 'utf-8');
const searchStr = '<SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />';
const replaceStr = '{Array.isArray(props.value || props.defaultValue) ? (props.value || props.defaultValue).map((_, i) => (<SliderPrimitive.Thumb key={i} className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />)) : (<SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />)}';
code = code.replace(searchStr, replaceStr);
fs.writeFileSync('src/components/ui/slider.tsx', code);
console.log("Patched slider.tsx");
