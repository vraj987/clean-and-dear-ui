export function getKavachDeviceAgeMonths(purchaseDate: string, today = new Date()) {
  if (!purchaseDate) return 0;
  const [year, month, day] = purchaseDate.split("-").map(Number);
  if (!year || !month || !day) return 0;

  let elapsedMonths = (today.getFullYear() - year) * 12 + today.getMonth() + 1 - month;
  if (today.getDate() < day) elapsedMonths -= 1;

  return Math.max(0, elapsedMonths);
}

export function getMinimumKavachDuration(purchaseDate: string, today = new Date()) {
  const deviceAge = getKavachDeviceAgeMonths(purchaseDate, today);
  return Math.min(24, Math.max(1, deviceAge + 1));
}

export function getDurationMilestones(startMonth: number, endMonth = 24) {
  const start = Math.max(1, Math.min(endMonth, Math.floor(startMonth)));
  const end = Math.max(start, Math.floor(endMonth));
  if (start === end) return [start];

  const interval = start >= 20 ? 1 : start >= 10 ? 4 : start >= 3 ? 3 : 4;
  const milestones = [start];
  let month = Math.ceil((start + 1) / interval) * interval;
  while (month < end) {
    if (month > start) milestones.push(month);
    month += interval;
  }
  if (milestones[milestones.length - 1] !== end) milestones.push(end);
  return milestones;
}
