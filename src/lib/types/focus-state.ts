import { FlowState } from './focus-types';

export function determineFlowState(
  productivityTrend: number[],
  currentProductivity: number,
  energyLevel: number
): FlowState {
  // No productivity data
  if (!productivityTrend.length) {
    return 'resting';
  }

  // Check for flow state
  if (productivityTrend.length >= 2 && productivityTrend.every(p => p > 0.8) && energyLevel > 7) {
    return 'flowing';
  }

  // Check for building momentum
  if (currentProductivity > 0.7 && energyLevel >= 6) {
    return 'building';
  }

  // Check for declining state
  if (productivityTrend.length >= 2 &&
      productivityTrend[0] > productivityTrend[productivityTrend.length - 1]) {
    return 'declining';
  }

  // Default to resting state
  return 'resting';
}
