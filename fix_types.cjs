const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf-8');
  if (!code.includes('any')) return;
  
  let modified = false;

  // Replace any[] with LoanRecord[]
  if (code.includes('any[]') && !code.includes('LoanRecord')) {
    let relativePath = path.relative(path.dirname(filePath), 'src/types/domain.ts').replace(/\.ts$/, '');
    if (!relativePath.startsWith('.')) relativePath = './' + relativePath;
    
    // insert import after the last import
    const importRegex = /^import .*;/gm;
    let match;
    let lastImportIndex = 0;
    while ((match = importRegex.exec(code)) !== null) {
      lastImportIndex = match.index + match[0].length;
    }
    
    if (lastImportIndex > 0) {
      code = code.slice(0, lastImportIndex) + `\nimport { LoanRecord } from '${relativePath}';` + code.slice(lastImportIndex);
    } else {
      code = `import { LoanRecord } from '${relativePath}';\n` + code;
    }
  }

  if (code.includes('any[]')) {
    code = code.replace(/any\[\]/g, 'LoanRecord[]');
    modified = true;
  }
  
  // Replace generic `any` used in function parameters, often in iterators
  if (code.includes('(r: any)')) {
    code = code.replace(/\(r: any\)/g, '(r: LoanRecord)');
    modified = true;
  }
  if (code.includes('(d: any)')) {
    code = code.replace(/\(d: any\)/g, '(d: Record<string, unknown>)');
    modified = true;
  }
  if (code.includes('(a: any, b: any)')) {
    code = code.replace(/\(a: any, b: any\)/g, '(a: Record<string, unknown>, b: Record<string, unknown>)');
    modified = true;
  }
  if (code.includes('(e: any)')) {
    code = code.replace(/\(e: any\)/g, '(e: Record<string, unknown>)');
    modified = true;
  }
  if (code.includes('<any>')) {
    code = code.replace(/<any>/g, '<Record<string, unknown>>');
    modified = true;
  }
  if (code.includes('Record<string, any>')) {
    code = code.replace(/Record<string, any>/g, 'Record<string, unknown>');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, code);
    console.log("Updated", filePath);
  }
}

function walkSync(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach(function (name) {
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if (stat.isFile()) {
        callback(filePath, stat);
    } else if (stat.isDirectory()) {
        walkSync(filePath, callback);
    }
  });
}

walkSync('src', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    processFile(filePath);
  }
});
