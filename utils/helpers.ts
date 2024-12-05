function getSeatsLabel(count: number): string {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return `${count} місць`;
    }
    if (lastDigit === 1) {
        return `${count} місце`;
    } else if (lastDigit >= 2 && lastDigit <= 4) {
        return `${count} місця`;
    } else {
        return `${count} місць`;
    }
}

function formatDateWithMonth(date: Date): string {
    const day = date.getDate();

    const monthNamesGenitive = [
        "січня", "лютого", "березня", "квітня", "травня", "червня",
        "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"
    ];

    const monthGenitive = monthNamesGenitive[date.getMonth()];

    return `${day} ${monthGenitive}`;
}

function formatDateWithMonthAndYear(date: Date): string {
    return `${formatDateWithMonth(date)} ${date.getFullYear()}`;
}

function formatPrice(price: number) {
    return price % 1 === 0 ? Math.round(price) : (price).toFixed(2)
}

export default {
    getSeatsLabel, formatDateWithMonth, formatDateWithMonthAndYear, formatPrice
}