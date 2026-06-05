export const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

// 510 → "08:30"
export const minutesToTime = (minutes) => {
    const h = Math.floor(minutes / 60)
        .toString()
        .padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};
