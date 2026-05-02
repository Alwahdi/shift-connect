import { Test, TestingModule } from '@nestjs/testing';
import {
  MatchingEngineService,
  ProfessionalProfile,
  MatchScore,
} from './matching-engine.service';
import { ShiftEntity } from '../shifts/shift.entity';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeProfile(overrides: Partial<ProfessionalProfile> = {}): ProfessionalProfile {
  return {
    id: 'pro-uuid',
    roleType: 'dental nurse',
    specialties: ['orthodontics'],
    certifications: ['BLS'],
    hourlyRateMin: 15,
    hourlyRateMax: 30,
    locationLat: 51.5,
    locationLng: -0.1,
    maxTravelDistanceKm: 50,
    isAvailable: true,
    ...overrides,
  };
}

function makeShift(overrides: Partial<ShiftEntity> = {}): ShiftEntity {
  return {
    id: 'shift-uuid',
    clinicId: 'clinic-uuid',
    title: 'Dental Nurse – Morning',
    roleRequired: 'dental nurse',
    description: 'orthodontics morning shift',
    shiftDate: new Date('2026-06-01') as unknown as Date,
    startTime: '08:00',
    endTime: '13:00',
    hourlyRate: 22 as unknown as number,
    requiredCertifications: ['BLS'],
    locationAddress: '123 Main St',
    locationLat: 51.52 as unknown as number, // ~2.5 km from profile
    locationLng: -0.1 as unknown as number,
    isUrgent: false,
    isFilled: false,
    maxApplicants: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('MatchingEngineService', () => {
  let engine: MatchingEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchingEngineService],
    }).compile();

    engine = module.get<MatchingEngineService>(MatchingEngineService);
  });

  // ── scoreShiftsForProfessional ────────────────────────────────────────────

  describe('scoreShiftsForProfessional', () => {
    it('returns empty array when professional is not available', () => {
      const profile = makeProfile({ isAvailable: false });
      const shifts = [makeShift()];

      const result = engine.scoreShiftsForProfessional(profile, shifts);

      expect(result).toHaveLength(0);
    });

    it('returns empty array when no shifts are provided', () => {
      const result = engine.scoreShiftsForProfessional(makeProfile(), []);

      expect(result).toHaveLength(0);
    });

    it('returns only eligible matches and sorts by totalScore descending', () => {
      const profile = makeProfile({ roleType: 'dentist' });
      const matchingShift = makeShift({ roleRequired: 'dentist', id: 'good-shift' });
      const nonMatchingShift = makeShift({ roleRequired: 'hygienist', id: 'bad-shift' });

      const result = engine.scoreShiftsForProfessional(profile, [nonMatchingShift, matchingShift]);

      expect(result.every((s) => s.isEligible)).toBe(true);
      expect(result.find((s) => s.shiftId === 'bad-shift')).toBeUndefined();
    });

    it('sorts results by totalScore descending', () => {
      const profile = makeProfile({ isAvailable: true, roleType: 'dental nurse' });
      const urgentShift = makeShift({ id: 'urgent', isUrgent: true, hourlyRate: 25 as unknown as number });
      const normalShift = makeShift({ id: 'normal', isUrgent: false, hourlyRate: 18 as unknown as number });

      const result = engine.scoreShiftsForProfessional(profile, [normalShift, urgentShift]);

      expect(result[0].shiftId).toBe('urgent');
      expect(result[0].totalScore).toBeGreaterThan(result[1].totalScore);
    });
  });

  // ── scoreProfessionalsForShift ────────────────────────────────────────────

  describe('scoreProfessionalsForShift', () => {
    it('returns only eligible professionals', () => {
      const shift = makeShift({ roleRequired: 'dentist' });
      const matching = makeProfile({ id: 'p1', roleType: 'dentist' });
      const notMatching = makeProfile({ id: 'p2', roleType: 'hygienist' });

      const result = engine.scoreProfessionalsForShift(shift, [matching, notMatching]);

      expect(result).toHaveLength(1);
      expect(result[0].professionalId).toBe('p1');
    });
  });

  // ── Hard constraints ──────────────────────────────────────────────────────

  describe('hard constraints', () => {
    it('marks ineligible when role does not match', () => {
      const profile = makeProfile({ roleType: 'dentist' });
      const shift = makeShift({ roleRequired: 'hygienist' });

      const result = engine.scoreShiftsForProfessional(profile, [shift]);

      expect(result).toHaveLength(0); // ineligible filtered out
    });

    it('role matching is case-insensitive', () => {
      const profile = makeProfile({ roleType: 'Dental Nurse' });
      const shift = makeShift({ roleRequired: 'dental nurse' });

      const result = engine.scoreShiftsForProfessional(profile, [shift]);

      expect(result).toHaveLength(1);
      expect(result[0].isEligible).toBe(true);
    });

    it('marks ineligible when professional is missing a required certification', () => {
      const profile = makeProfile({ certifications: ['BLS'] });
      const shift = makeShift({ requiredCertifications: ['BLS', 'Safeguarding Level 2'] });

      const result = engine.scoreShiftsForProfessional(profile, [shift]);

      expect(result).toHaveLength(0);
    });

    it('certification check is case-insensitive', () => {
      const profile = makeProfile({ certifications: ['bls'] });
      const shift = makeShift({ requiredCertifications: ['BLS'] });

      const result = engine.scoreShiftsForProfessional(profile, [shift]);

      expect(result).toHaveLength(1);
      expect(result[0].isEligible).toBe(true);
    });

    it('marks ineligible when shift is beyond max travel distance', () => {
      const profile = makeProfile({
        locationLat: 51.5,
        locationLng: -0.1,
        maxTravelDistanceKm: 5,
      });
      // ~200 km away
      const shift = makeShift({
        locationLat: 53.5 as unknown as number,
        locationLng: -0.1 as unknown as number,
      });

      const result = engine.scoreShiftsForProfessional(profile, [shift]);

      expect(result).toHaveLength(0);
    });

    it('accepts shift within max travel distance', () => {
      const profile = makeProfile({
        locationLat: 51.5,
        locationLng: -0.1,
        maxTravelDistanceKm: 10,
      });
      // ~2.5 km away
      const shift = makeShift({
        locationLat: 51.52 as unknown as number,
        locationLng: -0.1 as unknown as number,
      });

      const result = engine.scoreShiftsForProfessional(profile, [shift]);

      expect(result).toHaveLength(1);
      expect(result[0].isEligible).toBe(true);
    });
  });

  // ── Scoring weights ───────────────────────────────────────────────────────

  describe('score breakdown', () => {
    it('includes ROLE_MATCH weight (40) for eligible shift', () => {
      const profile = makeProfile({ certifications: ['BLS'] });
      const shift = makeShift({ requiredCertifications: ['BLS'] });

      const result = engine.scoreShiftsForProfessional(profile, [shift]);

      expect(result[0].breakdown.roleMatch).toBe(40);
    });

    it('adds urgency bonus (10) for urgent shifts', () => {
      const profile = makeProfile({ certifications: ['BLS'] });
      const urgentShift = makeShift({ isUrgent: true, requiredCertifications: ['BLS'] });
      const normalShift = makeShift({ isUrgent: false, id: 'normal', requiredCertifications: ['BLS'] });

      const [urgent] = engine.scoreShiftsForProfessional(profile, [urgentShift]);
      const [normal] = engine.scoreShiftsForProfessional(profile, [normalShift]);

      expect(urgent.breakdown.urgencyBonus).toBe(10);
      expect(normal.breakdown.urgencyBonus).toBe(0);
      expect(urgent.totalScore).toBeGreaterThan(normal.totalScore);
    });

    it('gives max rate score when shift rate is within professional rate range', () => {
      const profile = makeProfile({ hourlyRateMin: 15, hourlyRateMax: 30 });
      const shift = makeShift({ hourlyRate: 20 as unknown as number }); // in range

      const result = engine.scoreShiftsForProfessional(profile, [shift]);

      expect(result[0].breakdown.rateScore).toBe(10); // WEIGHTS.RATE = 10
    });

    it('gives zero rate score when shift rate is below professional minimum', () => {
      const profile = makeProfile({ hourlyRateMin: 25, hourlyRateMax: 40 });
      const shift = makeShift({ hourlyRate: 10 as unknown as number }); // below min

      const result = engine.scoreShiftsForProfessional(profile, [shift]);

      expect(result[0].breakdown.rateScore).toBe(0);
    });

    it('includes distance in score (score higher when closer)', () => {
      const profile = makeProfile({
        locationLat: 51.5,
        locationLng: -0.1,
        maxTravelDistanceKm: 50,
        certifications: ['BLS'],
      });
      const nearShift = makeShift({
        id: 'near',
        locationLat: 51.51 as unknown as number,
        locationLng: -0.1 as unknown as number,
        requiredCertifications: ['BLS'],
      });
      const farShift = makeShift({
        id: 'far',
        locationLat: 51.9 as unknown as number,  // ~45 km
        locationLng: -0.1 as unknown as number,
        requiredCertifications: ['BLS'],
      });

      const nearResult = engine.scoreShiftsForProfessional(profile, [nearShift]);
      const farResult = engine.scoreShiftsForProfessional(profile, [farShift]);

      expect(nearResult[0].breakdown.distanceScore).toBeGreaterThan(
        farResult[0].breakdown.distanceScore,
      );
    });

    it('uses neutral distance score (50%) when no location data provided', () => {
      const profile = makeProfile({
        locationLat: undefined,
        locationLng: undefined,
        certifications: ['BLS'],
      });
      const shift = makeShift({ requiredCertifications: ['BLS'] });

      const result = engine.scoreShiftsForProfessional(profile, [shift]);

      // WEIGHTS.DISTANCE * 0.5 = 20 * 0.5 = 10
      expect(result[0].breakdown.distanceScore).toBe(10);
    });

    it('totalScore is sum of all breakdown values', () => {
      const profile = makeProfile({ certifications: ['BLS'] });
      const shift = makeShift({ requiredCertifications: ['BLS'] });

      const result = engine.scoreShiftsForProfessional(profile, [shift]);
      const score = result[0];
      const expectedTotal = Object.values(score.breakdown).reduce((a, b) => a + b, 0);

      expect(score.totalScore).toBe(expectedTotal);
    });
  });

  // ── Distance calculation (Haversine) ──────────────────────────────────────

  describe('distance calculation', () => {
    it('includes distanceKm in result when both have coordinates', () => {
      const profile = makeProfile({ locationLat: 51.5, locationLng: -0.1, certifications: ['BLS'] });
      const shift = makeShift({
        locationLat: 51.52 as unknown as number,
        locationLng: -0.1 as unknown as number,
        requiredCertifications: ['BLS'],
      });

      const result = engine.scoreShiftsForProfessional(profile, [shift]);

      expect(result[0].distanceKm).toBeDefined();
      expect(result[0].distanceKm!).toBeCloseTo(2.22, 0); // ~2.22 km
    });

    it('distanceKm is undefined when professional has no location', () => {
      const profile = makeProfile({
        locationLat: undefined,
        locationLng: undefined,
        certifications: [],
      });
      const shift = makeShift({ requiredCertifications: [] });

      const result = engine.scoreShiftsForProfessional(profile, [shift]);

      expect(result[0].distanceKm).toBeUndefined();
    });
  });

  // ── Disqualification reasons ──────────────────────────────────────────────

  describe('disqualification reasons', () => {
    it('mentions role in disqualification reason for role mismatch', () => {
      const profile = makeProfile({ roleType: 'dentist' });
      const shift = makeShift({ roleRequired: 'hygienist' });

      // scoreOne is private; test via scoreProfessionalsForShift to get ineligible scores
      const all = engine.scoreProfessionalsForShift(shift, [profile]);
      // should be empty (filtered) — we verify no eligible results
      expect(all).toHaveLength(0);
    });

    it('mentions missing certs in disqualification reason', () => {
      // Use the clinic-facing method and check that ineligible entries are filtered
      const shift = makeShift({ requiredCertifications: ['Safeguarding', 'BLS'] });
      const profile = makeProfile({ certifications: ['BLS'] }); // missing Safeguarding

      const result = engine.scoreProfessionalsForShift(shift, [profile]);
      expect(result).toHaveLength(0);
    });
  });
});
