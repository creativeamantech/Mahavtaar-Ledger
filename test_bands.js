function getPOSBand(pos) {
    if (pos < 1000) return '< 1k';
    if (pos < 10000) {
        const lower = Math.floor(pos / 1000);
        return `${lower}k-${lower + 1}k`;
    }
    const lower = Math.floor(pos / 5000) * 5;
    return `${lower}k-${lower + 5}k`;
}

console.log(getPOSBand(500));
console.log(getPOSBand(1500));
console.log(getPOSBand(9500));
console.log(getPOSBand(12000));
console.log(getPOSBand(51000));
