sed -i '/return records.filter((r: any) => String(r.bom_bkt).trim().toUpperCase() === globalBucket);/,/}, \[records, globalBucket\]);/!b;//!d;/}, \[records, globalBucket\]);/a\
  const teamPerfData = useMemo(() => buildExecCityPivot(filteredRecords, targets), [filteredRecords, targets]);\
  const teamPerfGrouped = useMemo(() => {\
    const groups: Record<number, any[]> = {};\
    teamPerfData.forEach(t => {\
      if (!groups[t.bkt]) groups[t.bkt] = [];\
      groups[t.bkt].push(t);\
    });\
    return Object.entries(groups).map(([bkt, items]) => [Number(bkt), items.sort((a: any, b: any) => b.collection - a.collection)] as const).sort((a, b) => a[0] - b[0]);\
  }, [teamPerfData]);\
  const teamPerfGrandTotal = useMemo(() => {\
    return {\
      collection: teamPerfData.reduce((s, i) => s + i.collection, 0),\
      count: teamPerfData.reduce((s, i) => s + i.count, 0),\
      paid: teamPerfData.reduce((s, i) => s + i.paid, 0),\
      totalPOS: teamPerfData.reduce((s, i) => s + i.totalPOS, 0),\
      paidPOS: teamPerfData.reduce((s, i) => s + i.paidPOS, 0),\
      posPaidOnlyCount: teamPerfData.reduce((s, i) => s + i.posPaidOnlyCount, 0),\
      posPaidOnlyPOS: teamPerfData.reduce((s, i) => s + i.posPaidOnlyPOS, 0),\
      target: teamPerfData.reduce((s, i) => s + i.target, 0),\
      dailyRequiredPOS: teamPerfData.reduce((s, i) => s + (i.dailyRequiredPOS || 0), 0),\
    };\
  }, [teamPerfData]);
' src/pages/ExecDashboard.tsx
