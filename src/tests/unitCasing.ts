// Units and formulas keep their exact casing, so none may sit inside an element styled uppercase.
export const UNIT_PATTERN = /kPa|whp|wNm|\bhp\b|\bNm\b|\/L\b|litre \//;

/** The text of every uppercase-styled element that holds a unit or a formula. */
export function uppercaseUnitText(container: HTMLElement): string[] {
    return [...container.querySelectorAll<HTMLElement>('.uppercase, .small-caps')]
        .map(el => el.textContent ?? '')
        .filter(text => UNIT_PATTERN.test(text));
}
