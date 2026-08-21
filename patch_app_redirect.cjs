const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />',
  '<Route path="/login" element={user ? <Navigate to={user.role === "EXECUTIVE" ? "/exec-dashboard" : "/dashboard"} replace /> : <Login />} />'
);

content = content.replace(
  '<Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />',
  '<Route path="/" element={<Navigate to={user ? (user.role === "EXECUTIVE" ? "/exec-dashboard" : "/dashboard") : "/login"} replace />} />'
);

content = content.replace(
  'if (view) return <PermissionGate view={view} fallback={<Navigate to="/dashboard" replace />}>{children}</PermissionGate>;',
  'if (view) return <PermissionGate view={view} fallback={<Navigate to={user?.role === "EXECUTIVE" ? "/exec-dashboard" : "/dashboard"} replace />}>{children}</PermissionGate>;'
);

fs.writeFileSync(file, content);
console.log('App.tsx patched redirects');
