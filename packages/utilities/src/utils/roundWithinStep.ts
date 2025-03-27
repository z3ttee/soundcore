/**
 * Round a number within steps.
 * For example rounding using step of 4:
 * 1 --> 0
 * 3 --> 4
 * 4 --> 4
 * 5 --> 4
 * 7 --> 8
 * @param number Number input
 * @param step Step as positive value (defaults to 0.5)
 * @returns Rounded number
 */
export function roundWithinSteps(number: number, step: number = 0.5): number {
  if (step <= 0)
    throw new Error("Supplied negative or zero value to the roundWithinSteps()-function which is not allowed");
  return Math.ceil(number / step) * step;
}
