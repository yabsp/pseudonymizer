import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { categorizePresidioEntities, GLINER_LABELS } from '../helpers/core.mjs';

describe('categories of values found with Presidio', () => {
  const categorize = (entities) => categorizePresidioEntities(entities, GLINER_LABELS).map((e) => [e.text, e.category]);

  it('maps Presidio\'s types and keeps GLiNER\'s labels', () => {
    assert.deepEqual(categorize([
      { text: 'Reto Ammann', label: 'person', source: 'gliner' },
      { text: 'Lea', label: 'PERSON', source: 'presidio' },
      { text: 'Pratteln', label: 'LOCATION', source: 'presidio' },
      { text: '076 432 18 90', label: 'PHONE_NUMBER', source: 'presidio' },
    ]), [['Reto Ammann', 'PERSON'], ['Lea', 'PERSON'], ['Pratteln', 'ADDRESS'], ['076 432 18 90', 'PHONE']]);
  });

  it('hides values of unknown types instead of dropping them', () => {
    assert.deepEqual(categorize([
      { text: 'AB123456', label: 'DE_PASSPORT', source: 'presidio' },
      { text: 'x1', label: '__proto__', source: 'presidio' },
      { text: 'x2', label: 'toString', source: 'presidio' },
    ]), [['AB123456', 'OTHER'], ['x1', 'OTHER'], ['x2', 'OTHER']]);
  });

  it('ignores plain dates and nationalities, as the GLiNER labels do', () => {
    assert.deepEqual(categorize([
      { text: '22.10.2026', label: 'DATE_TIME', source: 'presidio' },
      { text: 'Swiss', label: 'NRP', source: 'presidio' },
    ]), []);
  });
});
