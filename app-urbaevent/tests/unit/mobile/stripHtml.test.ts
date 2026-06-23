import { describe, it, expect } from 'vitest';
import { stripHtml } from '../../../../apps/mobile/src/lib/stripHtml';

describe('Mobile — stripHtml', () => {
  it('supprime balises HTML', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
    expect(stripHtml('  plain  ')).toBe('plain');
    expect(stripHtml('<div><br/><span>  a  </span></div>')).toBe('a');
  });
});
