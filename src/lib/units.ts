/** Metric ↔ imperial conversions. Profile always stores metric canonically. */

export function ftInToCm(feet: number, inches: number): number {
  return Math.round((feet * 30.48 + inches * 2.54) * 10) / 10
}

export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalIn = cm / 2.54
  let feet = Math.floor(totalIn / 12)
  let inches = Math.round(totalIn - feet * 12)
  if (inches === 12) {
    feet += 1
    inches = 0
  }
  return { feet, inches }
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.45359237 * 10) / 10
}

export function kgToLbs(kg: number): number {
  return Math.round((kg / 0.45359237) * 10) / 10
}
