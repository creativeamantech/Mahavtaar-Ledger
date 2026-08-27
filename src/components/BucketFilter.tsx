import { useData } from '../contexts/DataContext';
import { useMemo } from 'react';

export function BucketFilter() {
  const { records, globalBucket, setGlobalBucket } = useData();

  const availableBuckets = useMemo(() => {
    const bkts = new Set<string>();
    (records || []).forEach((r: any) => {
      if (r.bom_bkt) bkts.add(String(r.bom_bkt).trim().toUpperCase());
    });
    return Array.from(bkts).sort();
  }, [records]);

  if (availableBuckets.length === 0) return null;

  return (
    <div className="flex bg-muted/30 p-1 rounded-lg border border-border w-max overflow-x-auto no-scrollbar">
      <button
        type="button"
        onClick={() => setGlobalBucket('ALL')}
        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${globalBucket === 'ALL' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:bg-muted'}`}
      >
        All Buckets
      </button>
      {availableBuckets.map(b => (
        <button
          type="button"
          key={b}
          onClick={() => setGlobalBucket(b)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${globalBucket === b ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:bg-muted'}`}
        >
          Bucket {b}
        </button>
      ))}
    </div>
  );
}
