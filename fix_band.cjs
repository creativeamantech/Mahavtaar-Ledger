const fs = require('fs');
const file = 'src/pages/BandExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

const correctThead = `<thead className="text-xs uppercase sticky top-0 z-20 shadow-md">
                        <tr className="bg-muted text-muted-foreground">
                            <th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80" onClick={() => handleSort('aggr')}>
                                <div className="flex items-center">Agreement Number <SortIcon columnKey="aggr" /></div>
                            </th>
                            <th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80 hidden md:table-cell" onClick={() => handleSort('name')}>
                                <div className="flex items-center">Customer Name <SortIcon columnKey="name" /></div>
                            </th>
                            <th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80 hidden sm:table-cell" onClick={() => handleSort('city')}>
                                <div className="flex items-center">City <SortIcon columnKey="city" /></div>
                            </th>
                            <th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80" onClick={() => handleSort('pos')}>
                                <div className="flex items-center justify-end">Principal (POS) <SortIcon columnKey="pos" /></div>
                            </th>
                            <th className="px-4 py-3 font-semibold border-b border-border bg-muted cursor-pointer hover:bg-muted/80 hidden sm:table-cell" onClick={() => handleSort('emi')}>
                                <div className="flex items-center justify-end">EMI <SortIcon columnKey="emi" /></div>
                            </th>
                        </tr>
                    </thead>`;

content = content.replace(/<thead className="text-xs uppercase sticky top-0 z-20 shadow-md">[\s\S]*?<\/thead>/, correctThead);

fs.writeFileSync(file, content);
