// A plain address with one @ and a dot in the domain, and nothing that would change a mailto link.
const EMAIL = /^[^\s@?#&%<>"'/\\]+@[^\s@?#&%<>"'/\\]+\.[^\s@?#&%<>"'/\\]+$/;

/** A mailto link for a plain email address, or null when it does not look like one. */
export function mailtoHref(email: string): string | null {
    const trimmed = email.trim();
    return EMAIL.test(trimmed) ? `mailto:${trimmed}` : null;
}

/** A tel link with only the digits and a leading +, or null when there are no digits. */
export function telHref(phone: string): string | null {
    const digits = phone.replace(/\D/g, '');
    if (!digits) return null;
    return `tel:${phone.trim().startsWith('+') ? '+' : ''}${digits}`;
}
