import { describe, expect, it } from 'vitest';
import { datetimeLocalValue, fechaLocalISO } from '@/lib/utils';

describe('fechaLocalISO', () => {
  it('formatea la fecha local como YYYY-MM-DD con ceros a la izquierda', () => {
    expect(fechaLocalISO(new Date(2026, 0, 5, 10, 0))).toBe('2026-01-05');
  });

  it('usa el día local aunque en UTC ya sea el día siguiente', () => {
    expect(fechaLocalISO(new Date(2026, 8, 25, 23, 30))).toBe('2026-09-25');
  });
});

describe('datetimeLocalValue', () => {
  it('formatea la fecha local como YYYY-MM-DDTHH:mm', () => {
    expect(datetimeLocalValue(new Date(2026, 8, 25, 9, 5))).toBe('2026-09-25T09:05');
  });
});
