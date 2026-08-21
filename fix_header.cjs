const fs = require('fs');
let code = fs.readFileSync('src/components/layout/DesktopHeader.tsx', 'utf-8');

code = code.replace(
    "export function DesktopHeader() {\n  const navigate = useNavigate();\n  const { user, isExecutive } = useAuth();",
    "export function DesktopHeader() {\n  const { user, isExecutive } = useAuth();"
);

fs.writeFileSync('src/components/layout/DesktopHeader.tsx', code);
console.log("Fixed DesktopHeader");

let code2 = fs.readFileSync('src/components/layout/MobileHeader.tsx', 'utf-8');
if (code2.split('const navigate = useNavigate();').length > 2) {
    code2 = code2.replace("export function MobileHeader({ onMenuClick }: MobileHeaderProps) {\n  const navigate = useNavigate();", "export function MobileHeader({ onMenuClick }: MobileHeaderProps) {");
    fs.writeFileSync('src/components/layout/MobileHeader.tsx', code2);
    console.log("Fixed MobileHeader");
}
