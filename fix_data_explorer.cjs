const fs = require('fs');
let code = fs.readFileSync('src/pages/DataExplorer.tsx', 'utf-8');

// 1. Pagination logic
code = code.replace(
  /const paginatedRecords = useMemo\(\(\) => \{\n\s*return sortedRecords\.slice\(\(page - 1\) \* itemsPerPage, page \* itemsPerPage\);\n\s*\}, \[sortedRecords, page, itemsPerPage\]\);/,
  `const paginatedRecords = useMemo(() => {
    if (itemsPerPage === 999999) return sortedRecords;
    return sortedRecords.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [sortedRecords, page, itemsPerPage]);

  const rowVirtualizer = useVirtualizer({
    count: paginatedRecords.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => density === 'detailed' ? 48 : density === 'comfortable' ? 40 : 32,
    overscan: 10,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();`
);

// 2. Table rows rendering
const targetMap = /paginatedRecords\.map\(\(r: any, idx: number\) => \{/g;
code = code.replace(
  targetMap,
  `
                virtualItems.length > 0 && virtualItems[0].start > 0 && (
                  <tr style={{ height: \`\${virtualItems[0].start}px\` }}>
                    <td colSpan={12 + (visibleExtraColumns || []).length} style={{ padding: 0, border: 0 }} />
                  </tr>
                )
              }
              {
                virtualItems.map((virtualRow) => {
                  const idx = virtualRow.index;
                  const r = paginatedRecords[idx];
`
);

// Close padding
const closeMap = /\}\)\n\s*\)\}\n\s*<\/tbody>/g;
code = code.replace(
  closeMap,
  `})
              }
              {
                virtualItems.length > 0 && virtualItems[virtualItems.length - 1].end < rowVirtualizer.getTotalSize() && (
                  <tr style={{ height: \`\${rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end}px\` }}>
                    <td colSpan={12 + (visibleExtraColumns || []).length} style={{ padding: 0, border: 0 }} />
                  </tr>
                )
              }
            )}
            </tbody>`
);

// 3. Option value
const optionReplace = /<option value=\{100\}>100<\/option>/g;
code = code.replace(
  optionReplace,
  `<option value={100}>100</option>
                <option value={999999}>All (Virtualized)</option>`
);

fs.writeFileSync('src/pages/DataExplorer.tsx', code);
