import { describe, it, expect } from 'vitest';
import { mailtoHref, telHref } from '@/lib/contactLinks';

describe('mailtoHref', () => {
    it('links a plain address', () => {
        expect(mailtoHref('post@nstuning.no')).toBe('mailto:post@nstuning.no');
        expect(mailtoHref('  post.office+web@ns-tuning.co.uk ')).toBe('mailto:post.office+web@ns-tuning.co.uk');
    });

    it('refuses anything that would add to or change the link', () => {
        for (const email of ['post@nstuning.no?subject=Hi', 'post@nstuning.no#top', 'a@b.no&cc=c@d.no', 'a b@c.no', 'a@b@c.no', 'nodomain@', 'no-at.no', 'a@nodot', 'a@b.no/x', '%40@b.no', '']) {
            expect(mailtoHref(email)).toBeNull();
        }
    });
});

describe('telHref', () => {
    it('keeps only the digits and a leading +', () => {
        expect(telHref('+47 900 00 000')).toBe('tel:+4790000000');
        expect(telHref(' +47 (900) 00-000 ')).toBe('tel:+4790000000');
        expect(telHref('900 00 000?subject=x#y')).toBe('tel:90000000');
        expect(telHref('900+00')).toBe('tel:90000');
    });

    it('gives no link without digits', () => {
        expect(telHref('')).toBeNull();
        expect(telHref('ask us')).toBeNull();
        expect(telHref('+')).toBeNull();
    });
});
