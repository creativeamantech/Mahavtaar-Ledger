const fs = require('fs');
const file = 'src/pages/DataEntry.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const [uploadingState, setUploadingState]')) {
  content = content.replace(
    "const [conflictFilter, setConflictFilter] = useState('all');",
    "const [conflictFilter, setConflictFilter] = useState('all');\n  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});"
  );
}

// Main
content = content.replace(
  "const handleMainUpload = useCallback((file: File) => {\n    const reader = new FileReader();\n    reader.onload = (e) => {",
  `const handleMainUpload = useCallback(async (file: File) => {
    setUploadingState(p => ({ ...p, main: true }));
    await new Promise(r => setTimeout(r, 50));
    const reader = new FileReader();
    reader.onload = async (e) => {`
);
content = content.replace(
  "toast.error('Failed to parse file');\n      }\n    };\n    reader.readAsArrayBuffer(file);\n  }, [loadMainFile, user]);",
  `toast.error('Failed to parse file');
      } finally { setUploadingState(p => ({ ...p, main: false })); }
    };
    reader.readAsArrayBuffer(file);
  }, [loadMainFile, user]);`
);

// Paid
content = content.replace(
  "const handlePaidUpload = useCallback((file: File) => {\n    const reader = new FileReader();\n    reader.onload = (e) => {",
  `const handlePaidUpload = useCallback(async (file: File) => {
    setUploadingState(p => ({ ...p, paid: true }));
    await new Promise(r => setTimeout(r, 50));
    const reader = new FileReader();
    reader.onload = async (e) => {`
);
content = content.replace(
  "toast.error('Failed to parse paid file');\n      }\n    };\n    reader.readAsArrayBuffer(file);\n  }, [loadPaidFile, user]);",
  `toast.error('Failed to parse paid file');
      } finally { setUploadingState(p => ({ ...p, paid: false })); }
    };
    reader.readAsArrayBuffer(file);
  }, [loadPaidFile, user]);`
);

// Additional
content = content.replace(
  "const handleAdditionalUpload = useCallback((file: File) => {\n    const reader = new FileReader();\n    reader.onload = (e) => {",
  `const handleAdditionalUpload = useCallback(async (file: File) => {
    setUploadingState(p => ({ ...p, add: true }));
    await new Promise(r => setTimeout(r, 50));
    const reader = new FileReader();
    reader.onload = async (e) => {`
);
content = content.replace(
  "toast.error('Failed to parse additional file');\n      }\n    };\n    reader.readAsArrayBuffer(file);\n  }, [loadAdditionalFile, user]);",
  `toast.error('Failed to parse additional file');
      } finally { setUploadingState(p => ({ ...p, add: false })); }
    };
    reader.readAsArrayBuffer(file);
  }, [loadAdditionalFile, user]);`
);

// Corrected
content = content.replace(
  "const handleCorrectedUpload = useCallback((file: File) => {\n    const reader = new FileReader();\n    reader.onload = (e) => {",
  `const handleCorrectedUpload = useCallback(async (file: File) => {
    setUploadingState(p => ({ ...p, corr: true }));
    await new Promise(r => setTimeout(r, 50));
    const reader = new FileReader();
    reader.onload = async (e) => {`
);
content = content.replace(
  "toast.error('Failed to parse corrected file');\n      }\n    };\n    reader.readAsArrayBuffer(file);\n  }, [loadCorrectedFile, user]);",
  `toast.error('Failed to parse corrected file');
      } finally { setUploadingState(p => ({ ...p, corr: false })); }
    };
    reader.readAsArrayBuffer(file);
  }, [loadCorrectedFile, user]);`
);

// Stepper status replacements
content = content.replace(
  "status: lastMain ? 'done' : 'pending',",
  "status: uploadingState.main ? 'uploading' : (lastMain ? 'done' : 'pending'),"
);
content = content.replace(
  "status: lastPaid ? 'done' : 'pending',",
  "status: uploadingState.paid ? 'uploading' : (lastPaid ? 'done' : 'pending'),"
);
content = content.replace(
  "status: lastAdditional ? 'done' : 'pending',",
  "status: uploadingState.add ? 'uploading' : (lastAdditional ? 'done' : 'pending'),"
);
content = content.replace(
  "status: lastCorrected ? 'done' : 'pending',",
  "status: uploadingState.corr ? 'uploading' : (lastCorrected ? 'done' : 'pending'),"
);

fs.writeFileSync(file, content);
