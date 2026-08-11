export const toScore = (value, label) => {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || number > 100) {
        throw new Error(`${label} harus berupa angka antara 0 dan 100`);
    }
    return number;
};

export const toNonNegativeInteger = (value, label) => {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 0) {
        throw new Error(`${label} harus berupa bilangan bulat tidak negatif`);
    }
    return number;
};

export const toPositiveInteger = (value, label) => {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
        throw new Error(`${label} harus berupa bilangan bulat lebih dari 0`);
    }
    return number;
};
