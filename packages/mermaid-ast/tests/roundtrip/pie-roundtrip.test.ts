/**
 * Pie Chart Round-trip Tests
 */

import { describe, expect, it } from 'bun:test';
import { Pie } from '../../src/pie.js';
import { parsePie } from '../../src/parser/pie-parser.js';
import { renderPie } from '../../src/renderer/pie-renderer.js';

describe('Pie Round-trip', () => {
  describe('Simple Round-trips', () => {
    it('should round-trip empty pie chart', async () => {
      const original = Pie.create();
      const rendered = original.render();
      const parsed = await Pie.parse(rendered);

      expect(parsed.toAST().type).toBe('pie');
      expect(parsed.sectionCount).toBe(0);
    });

    it('should round-trip pie chart with title', async () => {
      const original = Pie.create().setTitle('My Chart');
      const rendered = original.render();
      const parsed = await Pie.parse(rendered);

      expect(parsed.getTitle()).toBe('My Chart');
    });

    it('should round-trip pie chart with sections', async () => {
      const original = Pie.create().addSection('A', 30).addSection('B', 70);
      const rendered = original.render();
      const parsed = await Pie.parse(rendered);

      expect(parsed.sectionCount).toBe(2);
      expect(parsed.getSection('A')?.value).toBe(30);
      expect(parsed.getSection('B')?.value).toBe(70);
    });

    it('should round-trip pie chart with showData', async () => {
      const original = Pie.create().setShowData(true).addSection('Test', 100);
      const rendered = original.render();
      const parsed = await Pie.parse(rendered);

      expect(parsed.getShowData()).toBe(true);
    });
  });

  describe('Complex Round-trips', () => {
    it('should round-trip complete pie chart', async () => {
      const original = Pie.create()
        .setTitle('Browser Market Share')
        .setShowData(true)
        .addSection('Chrome', 65)
        .addSection('Safari', 19)
        .addSection('Firefox', 10)
        .addSection('Edge', 4)
        .addSection('Other', 2);

      const rendered = original.render();
      const parsed = await Pie.parse(rendered);

      expect(parsed.getTitle()).toBe('Browser Market Share');
      expect(parsed.getShowData()).toBe(true);
      expect(parsed.sectionCount).toBe(5);
      expect(parsed.getTotal()).toBe(100);
    });

    it('should round-trip pie chart with decimal values', async () => {
      const original = Pie.create()
        .addSection('A', 33.33)
        .addSection('B', 33.33)
        .addSection('C', 33.34);

      const rendered = original.render();
      const parsed = await Pie.parse(rendered);

      expect(parsed.sectionCount).toBe(3);
      expect(parsed.getTotal()).toBeCloseTo(100, 2);
    });

    it('should round-trip pie chart with labels containing spaces', async () => {
      const original = Pie.create().addSection('Category One', 50).addSection('Category Two', 50);

      const rendered = original.render();
      const parsed = await Pie.parse(rendered);

      expect(parsed.getSection('Category One')).toBeDefined();
      expect(parsed.getSection('Category Two')).toBeDefined();
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent', async () => {
      const original = Pie.create()
        .setTitle('Test')
        .setShowData(true)
        .addSection('A', 25)
        .addSection('B', 75);

      // First round-trip
      const rendered1 = original.render();
      const parsed1 = await Pie.parse(rendered1);

      // Second round-trip
      const rendered2 = parsed1.render();
      const parsed2 = await Pie.parse(rendered2);

      // Third round-trip
      const rendered3 = parsed2.render();

      // Output should stabilize
      expect(rendered2).toBe(rendered3);
    });
  });

  describe('Parse-Render-Parse', () => {
    it('should preserve structure through parse-render-parse', async () => {
      const input = `pie showData title Sales
"Q1" : 25
"Q2" : 25
"Q3" : 25
"Q4" : 25`;

      const ast1 = await parsePie(input);
      const rendered = renderPie(ast1);
      const ast2 = await parsePie(rendered);

      expect(ast2.title).toBe(ast1.title);
      expect(ast2.showData).toBe(ast1.showData);
      expect(ast2.sections.length).toBe(ast1.sections.length);

      for (let i = 0; i < ast1.sections.length; i++) {
        expect(ast2.sections[i].label).toBe(ast1.sections[i].label);
        expect(ast2.sections[i].value).toBe(ast1.sections[i].value);
      }
    });
  });
});
