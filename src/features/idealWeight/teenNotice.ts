import { LIMITS } from '@/domain/validation';

/** Yetişkin BMI ölçütlerinin doğrudan geçerli olduğu yaş. */
export const ADULT_AGE = 18;

/** 13–17 yaş: aralık yetişkin BMI ölçütlerine dayandığı için bilgi notu gösterilir. */
export function shouldShowTeenNotice(ageYears: number): boolean {
  return ageYears >= LIMITS.age.min && ageYears < ADULT_AGE;
}
