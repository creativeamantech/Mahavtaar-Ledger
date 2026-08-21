const fs = require('fs');
const file = 'src/components/layout/MobileHeader.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('Undo2')) {
  content = content.replace("import { ArrowLeft, ArrowRight } from 'lucide-react';", "import { ArrowLeft, ArrowRight, Undo2, Redo2, ChevronLeft, ChevronRight } from 'lucide-react';");
}
fs.writeFileSync(file, content);
