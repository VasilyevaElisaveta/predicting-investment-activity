function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

export function colorForRatio(ratio) {
    if (ratio == null || ratio == undefined || isNaN(ratio)) {
        return "#e5e7eb"; // Серый для отсутствующих данных
    }

    const r = Number(ratio);
    const t = 1.0; 
    const cap = 50; 

    if (Math.abs(r) <= t) return "#d89ef5ff"; // Стабильные (фиолетовый)

    if (r > 0) {
        const k = clamp(r / cap, 0, 1);
        return `rgb(${Math.round(230 - 180 * k)}, ${Math.round(
            245 - 185 * k
        )}, ${Math.round(255 - 90 * k)})`;
    } else {
        const k = clamp(Math.abs(r) / cap, 0, 1);
        return `rgb(${Math.round(255 - 105 * k)}, ${Math.round(
            230 - 210 * k
        )}, ${Math.round(230 - 210 * k)})`;
    }
}