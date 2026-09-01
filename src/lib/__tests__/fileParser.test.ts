import { describe, it, expect } from 'vitest';
import {
  mergePaidIntoRecords,
  mergeAdditionalIntoRecords,
  mergeCorrectedIntoRecords,
} from '../fileParser';

describe('fileParser.ts - Multi-File Ingestion & Merge Invariants', () => {
  const baseRecords = [
    {
      agreementid: 'AGR_M1',
      customer_name: 'Amit Kumar',
      city: 'MUMBAI',
      state: 'MAHARASHTRA',
      bom_bkt: 1,
      principal_outstanding: 100000,
      emi_amt: 5000,
      dac: 0,
      provisional_dac: 0,
      ecs: 0,
      special: 0,
    },
    {
      agreementid: 'AGR_M2',
      customer_name: 'Sunita Sharma',
      city: 'DELHI',
      state: 'DELHI',
      bom_bkt: 2,
      principal_outstanding: 80000,
      emi_amt: 4000,
      dac: 0,
      provisional_dac: 0,
      ecs: 0,
      special: 0,
    },
  ];

  it('mergePaidIntoRecords updates DAC and clears provisional matches', () => {
    const paidRows = [
      {
        agreementid: 'AGR_M1',
        dac: 5000,
        ecs: 0,
        special: 0,
      },
    ];

    const merged = mergePaidIntoRecords(baseRecords, paidRows);
    expect(merged).toHaveLength(2);
    
    const rec1 = merged.find((r: LoanRecord) => r.agreementid === 'AGR_M1');
    expect(rec1.dac).toBe(5000);
    expect(rec1.dac_source).toBe('PAID_FILE');
  });

  it('mergeAdditionalIntoRecords adds provisional dac without overriding corrected records', () => {
    const recordsWithOneCorrected = [
      {
        ...baseRecords[0],
        dac: 10000,
        dac_source: 'CORRECTED',
      },
      baseRecords[1],
    ];

    const additionalRows = [
      {
        agreementid: 'AGR_M1',
        provisional_dac: 3000,
        collection_dates: '2026-08-20',
      },
      {
        agreementid: 'AGR_M2',
        provisional_dac: 4000,
        collection_dates: '2026-08-21',
      },
    ];

    const result = mergeAdditionalIntoRecords(recordsWithOneCorrected, additionalRows);
    expect(result.stats.alreadyCorrected).toBe(1);
    expect(result.stats.newValidProv).toBe(1);
    
    const rec1 = result.merged.find((r: LoanRecord) => r.agreementid === 'AGR_M1');
    expect(rec1.dac).toBe(10000); // Maintained corrected value

    const rec2 = result.merged.find((r: LoanRecord) => r.agreementid === 'AGR_M2');
    expect(rec2.provisional_dac).toBe(4000);
  });

  it('mergeCorrectedIntoRecords overrides DAC and sets CORRECTED source', () => {
    const correctedRows = [
      {
        agreementid: 'AGR_M2',
        corrected_dac: 8000,
      },
    ];

    const result = mergeCorrectedIntoRecords(baseRecords, correctedRows);
    expect(result.matched).toBe(1);
    const rec2 = result.merged.find((r: LoanRecord) => r.agreementid === 'AGR_M2');
    expect(rec2.dac).toBe(8000);
    expect(rec2.dac_source).toBe('CORRECTED');
  });
});
