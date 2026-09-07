import { describe, expect, it } from 'vitest';
import { LAB_JOURNEY, journeyStepForStatus } from '@/features/lab/lib/journey';
import {
  LAB_CASE_PHASES,
  LAB_PLACE_INFOGRAPHIC_STEPS,
  buildOperatorQueue,
  canOpenPhase,
  dossierPhaseForStatus,
  infographicToCasePhase,
  isCurrentPhaseReady,
  isInfographicPlace,
  nextActionForStatus,
  phaseRailState,
  queueBucketForStatus,
  skipsConsultation,
  statusLabelFr,
} from '@/features/lab/lib/dossierPhases';

describe('lab dossier wizard phases', () => {
  it('maps 12 infographic steps to 10 case phases and keeps portail/dashboard as places', () => {
    expect(LAB_JOURNEY).toHaveLength(12);
    expect(LAB_CASE_PHASES).toHaveLength(10);
    expect(LAB_PLACE_INFOGRAPHIC_STEPS).toEqual([9, 10]);
    expect(isInfographicPlace(9)).toBe(true);
    expect(isInfographicPlace(10)).toBe(true);
    expect(infographicToCasePhase(9)).toBeNull();
    expect(infographicToCasePhase(10)).toBeNull();
    expect(infographicToCasePhase(11)).toBe(9);
    expect(infographicToCasePhase(12)).toBe(10);
    expect(infographicToCasePhase(1)).toBe(1);
    expect(journeyStepForStatus('INVOICED')).toBe(11);
    expect(dossierPhaseForStatus('INVOICED')).toBe(9);
    expect(dossierPhaseForStatus('CLOSED')).toBe(10);
    expect(dossierPhaseForStatus('NEW_REQUEST')).toBe(1);
    expect(dossierPhaseForStatus('WAITING_SAMPLES')).toBe(5);
  });

  it('gates the rail: jump only to completed or current, future locked', () => {
    expect(phaseRailState(1, 2)).toBe('done');
    expect(phaseRailState(2, 2)).toBe('current');
    expect(phaseRailState(3, 2)).toBe('locked');
    expect(canOpenPhase(1, 2)).toBe(true);
    expect(canOpenPhase(2, 2)).toBe(true);
    expect(canOpenPhase(3, 2)).toBe(false);
    expect(canOpenPhase(10, 1)).toBe(false);
  });

  it('enables Suivant only when the current phase required action is done', () => {
    expect(isCurrentPhaseReady({ status: 'NEW_REQUEST' })).toBe(false);
    expect(isCurrentPhaseReady({ status: 'NEW_REQUEST', acknowledgedRead: true })).toBe(true);

    expect(isCurrentPhaseReady({ status: 'QUALIFICATION', analysisKind: 'PHYSICO_CHIMIQUE' })).toBe(false);
    expect(isCurrentPhaseReady({
      status: 'QUALIFICATION',
      analysisKind: 'PHYSICO_CHIMIQUE',
      executionChannel: 'SUBCONTRACTED',
    })).toBe(true);

    expect(isCurrentPhaseReady({ status: 'WAITING_SUPPLIER_QUOTES', consultationStarted: true })).toBe(false);
    expect(isCurrentPhaseReady({ status: 'WAITING_SUPPLIER_QUOTES', supplierSelected: true })).toBe(true);
    expect(isCurrentPhaseReady({ status: 'WAITING_SUPPLIER_QUOTES', executionChannel: 'INTERNAL' })).toBe(true);

    expect(isCurrentPhaseReady({ status: 'CLIENT_QUOTE_SENT', quoteReady: true })).toBe(false);
    expect(isCurrentPhaseReady({ status: 'WAITING_CLIENT_RESPONSE', poAccepted: true })).toBe(true);

    expect(isCurrentPhaseReady({ status: 'WAITING_SAMPLES', sampleCount: 0 })).toBe(false);
    expect(isCurrentPhaseReady({ status: 'SAMPLES_CODED', sampleCount: 1 })).toBe(true);

    expect(isCurrentPhaseReady({ status: 'SENT_TO_SUPPLIER' })).toBe(false);
    expect(isCurrentPhaseReady({ status: 'ANALYSIS_IN_PROGRESS', analysisOrderSent: true })).toBe(true);

    expect(isCurrentPhaseReady({ status: 'FINAL_REVIEW' })).toBe(false);
    expect(isCurrentPhaseReady({ status: 'FINAL_REVIEW', finalApproved: true })).toBe(true);

    expect(isCurrentPhaseReady({ status: 'APPROVED' })).toBe(false);
    expect(isCurrentPhaseReady({ status: 'REPORT_GENERATION', reportSent: true })).toBe(true);

    expect(isCurrentPhaseReady({ status: 'INVOICED' })).toBe(true);
    expect(isCurrentPhaseReady({ status: 'CLOSED' })).toBe(true);
  });

  it('skips consultation for internal channel and speaks French', () => {
    expect(skipsConsultation('INTERNAL')).toBe(true);
    expect(skipsConsultation('SUBCONTRACTED')).toBe(false);
    expect(statusLabelFr('NEW_REQUEST')).toBe('Nouvelle demande');
    expect(nextActionForStatus('NEW_REQUEST')).toMatch(/qualification/i);
    expect(nextActionForStatus('QUALIFICATION')).toMatch(/canal/i);
  });

  it('builds the operator queue grouped by bucket with wizard hrefs', () => {
    const queue = buildOperatorQueue([
      { id: 'a', status: 'NEW_REQUEST', dossier_number: 'DEM-SEED-01', company_name: 'Atlas Oils', product_name: 'Huile d’argan' },
      { id: 'b', status: 'FINAL_REVIEW', dossier_number: 'DEM-SEED-09', company_name: 'Souss' },
      { id: 'c', status: 'WAITING_SAMPLES', dossier_number: 'DEM-SEED-06', company_name: 'Souss' },
      { id: 'd', status: 'CLOSED', dossier_number: 'DEM-SEED-12', company_name: 'Souss' },
    ], ['c']);
    expect(queue.map((q) => q.dossier)).toEqual(['DEM-SEED-06', 'DEM-SEED-01', 'DEM-SEED-09']);
    expect(queue[0].bucket).toBe('late');
    expect(queue[0].phase).toBe(5);
    expect(queue[0].href).toBe('/lab/admin/requests/c');
    expect(queue.find((q) => q.dossier === 'DEM-SEED-01')?.bucket).toBe('todo');
    expect(queue.find((q) => q.dossier === 'DEM-SEED-09')?.bucket).toBe('validate');
    expect(queueBucketForStatus('WAITING_SUPPLIER_QUOTES', false)).toBe('wait');
  });
});
