/**
 * Pie Chart Parser Tests
 */

import { describe, expect, it } from 'bun:test';
import { isPieDiagram, parsePie } from '../../src/parser/pie-parser.js';

describe('Pie Parser', () => {
  describe('isPieDiagram', () => {
    it('should detect pie diagram', () => {
      expect(isPieDiagram('pie')).toBe(true);
      expect(isPieDiagram('pie title Test')).toBe(true);
      expect(isPieDiagram('pie showData')).toBe(true);
      expect(isPieDiagram('  pie')).toBe(true);
      expect(isPieDiagram('\npie')).toBe(true);
    });

    it('should not detect non-pie diagrams', () => {
      expect(isPieDiagram('flowchart LR')).toBe(false);
      expect(isPieDiagram('sequenceDiagram')).toBe(false);
      expect(isPieDiagram('classDiagram')).toBe(false);
      expect(isPieDiagram('piexyz')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isPieDiagram('PIE')).toBe(true);
      expect(isPieDiagram('Pie')).toBe(true);
      expect(isPieDiagram('pIe')).toBe(true);
    });
  });

  describe('Basic Parsing', () => {
    it('should parse simple pie chart', async () => {
      const input = `pie
    "A" : 30
    "B" : 70`;
      const ast = await parsePie(input);
      expect(ast.type).toBe('pie');
      expect(ast.sections.length).toBe(2);
      expect(ast.sections[0].label).toBe('A');
      expect(ast.sections[0].value).toBe(30);
    });

    it('should parse pie chart with title', async () => {
      const input = `pie title My Chart
    "Slice 1" : 50
    "Slice 2" : 50`;
      const ast = await parsePie(input);
      expect(ast.title).toBe('My Chart');
    });

    it('should parse pie chart with showData', async () => {
      const input = `pie showData
    "A" : 25
    "B" : 75`;
      const ast = await parsePie(input);
      expect(ast.showData).toBe(true);
    });

    it('should parse pie chart with showData and title', async () => {
      const input = `pie showData title Sales Data
    "Q1" : 25
    "Q2" : 25
    "Q3" : 25
    "Q4" : 25`;
      const ast = await parsePie(input);
      expect(ast.showData).toBe(true);
      expect(ast.title).toBe('Sales Data');
      expect(ast.sections.length).toBe(4);
    });
  });

  describe('Section Parsing', () => {
    it('should parse integer values', async () => {
      const input = `pie
    "A" : 100`;
      const ast = await parsePie(input);
      expect(ast.sections[0].value).toBe(100);
    });

    it('should parse decimal values', async () => {
      const input = `pie
    "A" : 33.33
    "B" : 66.67`;
      const ast = await parsePie(input);
      expect(ast.sections[0].value).toBeCloseTo(33.33, 2);
      expect(ast.sections[1].value).toBeCloseTo(66.67, 2);
    });

    it('should parse labels with spaces', async () => {
      const input = `pie
    "Category One" : 50
    "Category Two" : 50`;
      const ast = await parsePie(input);
      expect(ast.sections[0].label).toBe('Category One');
      expect(ast.sections[1].label).toBe('Category Two');
    });

    it('should parse many sections', async () => {
      const input = `pie
    "A" : 10
    "B" : 10
    "C" : 10
    "D" : 10
    "E" : 10
    "F" : 10
    "G" : 10
    "H" : 10
    "I" : 10
    "J" : 10`;
      const ast = await parsePie(input);
      expect(ast.sections.length).toBe(10);
    });
  });

  describe('Edge Cases', () => {
    it('should parse pie with no sections', async () => {
      const input = `pie title Empty`;
      const ast = await parsePie(input);
      expect(ast.title).toBe('Empty');
      expect(ast.sections.length).toBe(0);
    });

    it('should parse pie with single section', async () => {
      const input = `pie
    "Only One" : 100`;
      const ast = await parsePie(input);
      expect(ast.sections.length).toBe(1);
    });

    it('should handle whitespace variations', async () => {
      const input = `pie    title   Spaced
    "A"   :   50
    "B"   :   50`;
      const ast = await parsePie(input);
      expect(ast.title).toBe('Spaced');
      expect(ast.sections.length).toBe(2);
    });
  });
});
