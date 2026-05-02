import { Injectable } from '@nestjs/common';
import { ShiftEntity } from '../shifts/shift.entity';

// ─── Input types ─────────────────────────────────────────────────────────────

export interface ProfessionalProfile {
  id: string;
  roleType: string;                       // e.g. "dentist", "dental nurse"
  specialties: string[];                  // e.g. ["orthodontics", "paediatrics"]
  certifications: string[];               // e.g. ["BLS", "Safeguarding Level 2"]
  hourlyRateMin?: number;                 // minimum acceptable pay
  hourlyRateMax?: number;                 // maximum acceptable pay
  locationLat?: number;
  locationLng?: number;
  maxTravelDistanceKm?: number;           // how far they are willing to travel
  isAvailable: boolean;
}

export interface MatchScore {
  shiftId: string;
  professionalId: string;
  totalScore: number;                     // 0–100
  breakdown: {
    roleMatch: number;                    // 0 or 40
    certificationMatch: number;           // 0–20
    distanceScore: number;               // 0–20
    rateScore: number;                    // 0–10
    urgencyBonus: number;                 // 0 or 10
  };
  distanceKm?: number;
  isEligible: boolean;                    // false if hard constraints not met
  disqualificationReason?: string;
}

// ─── Scoring constants ────────────────────────────────────────────────────────

const WEIGHTS = {
  ROLE_MATCH: 40,
  CERTIFICATION_MATCH: 20,   // per matched cert, up to 20 total
  DISTANCE: 20,
  RATE: 10,
  URGENCY_BONUS: 10,
} as const;

const EARTH_RADIUS_KM = 6371;

/**
 * MatchingEngineService
 *
 * Isolated, side-effect-free scoring engine.
 * Current implementation: rule-based scoring (O(n) per query).
 * Future: swap internals for a vector/ML approach without changing the API.
 *
 * Design principles:
 *   - Pure functions where possible — easy to unit-test
 *   - No database access — callers pass in resolved entities
 *   - Returns scored list sorted desc; callers decide how many results to surface
 */
@Injectable()
export class MatchingEngineService {
  /**
   * Score a single professional against a set of open shifts.
   * Returns all shifts with scores, sorted by totalScore desc.
   */
  scoreShiftsForProfessional(
    professional: ProfessionalProfile,
    shifts: ShiftEntity[],
  ): MatchScore[] {
    if (!professional.isAvailable) return [];

    const scores = shifts.map((shift) => this.scoreOne(professional, shift));
    return scores
      .filter((s) => s.isEligible)
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Score a set of professionals against a single shift (clinic-side view).
   * Returns eligible professionals sorted by score desc.
   */
  scoreProfessionalsForShift(
    shift: ShiftEntity,
    professionals: ProfessionalProfile[],
  ): MatchScore[] {
    return professionals
      .map((p) => this.scoreOne(p, shift))
      .filter((s) => s.isEligible)
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  // ── Private: score one (professional, shift) pair ─────────────────────────

  private scoreOne(professional: ProfessionalProfile, shift: ShiftEntity): MatchScore {
    // ── Hard constraint: role match ──────────────────────────────────────
    const roleMatch =
      professional.roleType.toLowerCase() === shift.roleRequired.toLowerCase();

    if (!roleMatch) {
      return this.ineligible(shift.id, professional.id, 'Role mismatch');
    }

    // ── Hard constraint: required certifications ─────────────────────────
    const missingCerts = (shift.requiredCertifications ?? []).filter(
      (cert) => !professional.certifications.some((c) => c.toLowerCase() === cert.toLowerCase()),
    );

    if (missingCerts.length > 0) {
      return this.ineligible(
        shift.id,
        professional.id,
        `Missing certifications: ${missingCerts.join(', ')}`,
      );
    }

    // ── Hard constraint: travel distance ────────────────────────────────
    let distanceKm: number | undefined;
    if (
      professional.locationLat !== undefined &&
      professional.locationLng !== undefined &&
      shift.locationLat !== undefined &&
      shift.locationLng !== undefined
    ) {
      distanceKm = this.haversineKm(
        professional.locationLat,
        professional.locationLng,
        Number(shift.locationLat),
        Number(shift.locationLng),
      );

      const maxDistance = professional.maxTravelDistanceKm ?? 50;
      if (distanceKm > maxDistance) {
        return this.ineligible(
          shift.id,
          professional.id,
          `Distance ${distanceKm.toFixed(1)} km exceeds max ${maxDistance} km`,
        );
      }
    }

    // ── Scoring: certified specialties overlap ───────────────────────────
    const shiftSpecialtyHints = (shift.title + ' ' + (shift.description ?? ''))
      .toLowerCase()
      .split(/\s+/);
    const matchedSpecialties = professional.specialties.filter((s) =>
      shiftSpecialtyHints.some((hint) => hint.includes(s.toLowerCase())),
    );
    const certificationMatch = Math.min(
      WEIGHTS.CERTIFICATION_MATCH,
      matchedSpecialties.length * (WEIGHTS.CERTIFICATION_MATCH / 3),
    );

    // ── Scoring: distance (lower = better) ──────────────────────────────
    const maxDist = professional.maxTravelDistanceKm ?? 50;
    const distanceScore =
      distanceKm !== undefined
        ? WEIGHTS.DISTANCE * Math.max(0, 1 - distanceKm / maxDist)
        : WEIGHTS.DISTANCE * 0.5; // no location data → neutral

    // ── Scoring: hourly rate fit ─────────────────────────────────────────
    const shiftRate = Number(shift.hourlyRate);
    let rateScore = WEIGHTS.RATE * 0.5; // default: neutral
    if (professional.hourlyRateMin !== undefined && professional.hourlyRateMax !== undefined) {
      const inRange =
        shiftRate >= professional.hourlyRateMin && shiftRate <= professional.hourlyRateMax;
      const aboveMin = shiftRate >= professional.hourlyRateMin;
      rateScore = inRange ? WEIGHTS.RATE : aboveMin ? WEIGHTS.RATE * 0.6 : 0;
    }

    // ── Bonus: urgent shifts ─────────────────────────────────────────────
    const urgencyBonus = shift.isUrgent ? WEIGHTS.URGENCY_BONUS : 0;

    const breakdown = {
      roleMatch: WEIGHTS.ROLE_MATCH,
      certificationMatch: Math.round(certificationMatch),
      distanceScore: Math.round(distanceScore),
      rateScore: Math.round(rateScore),
      urgencyBonus,
    };

    const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return {
      shiftId: shift.id,
      professionalId: professional.id,
      totalScore,
      breakdown,
      distanceKm,
      isEligible: true,
    };
  }

  private ineligible(shiftId: string, professionalId: string, reason: string): MatchScore {
    return {
      shiftId,
      professionalId,
      totalScore: 0,
      breakdown: { roleMatch: 0, certificationMatch: 0, distanceScore: 0, rateScore: 0, urgencyBonus: 0 },
      isEligible: false,
      disqualificationReason: reason,
    };
  }

  // ── Haversine formula (great-circle distance in km) ───────────────────────

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
