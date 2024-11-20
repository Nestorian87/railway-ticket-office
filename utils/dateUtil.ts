export function checkIsDateBeforeToday(date: Date): boolean {
    date.setHours(0, 0, 0, 0);

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    return date < todayMidnight
}