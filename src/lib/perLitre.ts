// Specific output per litre, normalised to 100 kPa absolute manifold pressure.
// NA (≈100 kPa) divides by 1, and 200 kPa absolute halves the figure.
// A missing or zero pressure counts as 100 kPa.
export function perLitreAt100kPa(value?: number | null, displacementCc?: number | null, kPa?: number | null): number | null {
    if (value == null || !displacementCc) return null;
    const litres = displacementCc / 1000;
    const ratio = (kPa && kPa > 0 ? kPa : 100) / 100;
    return Math.round((value / litres / ratio) * 10) / 10;
}
