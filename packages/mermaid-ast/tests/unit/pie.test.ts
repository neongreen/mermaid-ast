/**
 * Pie Chart Wrapper Tests
 */

import { describe, expect, it } from 'bun:test';
import { Pie } from '../../src/pie.js';
import type { PieAST } from '../../src/types/index.js';

describe('Pie Chart', () => {
  describe('Factory Methods', () => {
    it('should create empty pie chart', () => {
      const pie = Pie.create();
      const ast = pie.toAST();
      expect(ast.type).toBe('pie');
      expect(ast.showData).toBe(false);
      expect(ast.sections.length).toBe(0);
    });

    it('should create from existing AST', () => {
      const ast: PieAST = {
        type: 'pie',
        title: 'My Pie',
        showData: true,
        sections: [
          { label: 'A', value: 30 },
          { label: 'B', value: 70 },
        ],
      };
      const pie = Pie.from(ast);
      expect(pie.toAST().title).toBe('My Pie');
      expect(pie.toAST().sections.length).toBe(2);
    });

    it('should parse pie chart', async () => {
      const text = `pie title My Chart
    "Apples" : 30
    "Bananas" : 70`;
      const pie = await Pie.parse(text);
      expect(pie.toAST().title).toBe('My Chart');
      expect(pie.toAST().sections.length).toBe(2);
    });

    it('should parse pie chart with showData', async () => {
      const text = `pie showData title Sales
    "Q1" : 25
    "Q2" : 25
    "Q3" : 25
    "Q4" : 25`;
      const pie = await Pie.parse(text);
      expect(pie.toAST().showData).toBe(true);
      expect(pie.toAST().title).toBe('Sales');
      expect(pie.toAST().sections.length).toBe(4);
    });
  });

  describe('Core Methods', () => {
    it('should return AST with toAST()', () => {
      const pie = Pie.create();
      const ast = pie.toAST();
      expect(ast.type).toBe('pie');
    });

    it('should clone pie chart', () => {
      const original = Pie.create().setTitle('Original').addSection('A', 50);
      const cloned = original.clone();

      expect(cloned.getTitle()).toBe('Original');
      expect(cloned.sectionCount).toBe(1);

      // Verify independence
      cloned.setTitle('Cloned');
      expect(original.getTitle()).toBe('Original');
      expect(cloned.getTitle()).toBe('Cloned');
    });

    it('should render pie chart', () => {
      const pie = Pie.create().setTitle('My Pie').addSection('A', 30).addSection('B', 70);
      const output = pie.render();
      expect(output).toContain('pie');
      expect(output).toContain('title My Pie');
      expect(output).toContain('"A" : 30');
      expect(output).toContain('"B" : 70');
    });
  });

  describe('Title Operations', () => {
    it('should set title', () => {
      const pie = Pie.create().setTitle('My Chart');
      expect(pie.getTitle()).toBe('My Chart');
    });

    it('should get title', () => {
      const pie = Pie.create().setTitle('Test');
      expect(pie.getTitle()).toBe('Test');
    });

    it('should remove title', () => {
      const pie = Pie.create().setTitle('Test').removeTitle();
      expect(pie.getTitle()).toBeUndefined();
    });
  });

  describe('ShowData Operations', () => {
    it('should set showData to true', () => {
      const pie = Pie.create().setShowData(true);
      expect(pie.getShowData()).toBe(true);
    });

    it('should set showData to false', () => {
      const pie = Pie.create().setShowData(true).setShowData(false);
      expect(pie.getShowData()).toBe(false);
    });

    it('should default showData to false', () => {
      const pie = Pie.create();
      expect(pie.getShowData()).toBe(false);
    });
  });

  describe('Section Operations', () => {
    it('should add section', () => {
      const pie = Pie.create().addSection('Apples', 30);
      expect(pie.sectionCount).toBe(1);
      expect(pie.getSection('Apples')?.value).toBe(30);
    });

    it('should add multiple sections', () => {
      const pie = Pie.create()
        .addSection('A', 25)
        .addSection('B', 25)
        .addSection('C', 25)
        .addSection('D', 25);
      expect(pie.sectionCount).toBe(4);
    });

    it('should remove section by label', () => {
      const pie = Pie.create().addSection('A', 50).addSection('B', 50).removeSection('A');
      expect(pie.sectionCount).toBe(1);
      expect(pie.getSection('A')).toBeUndefined();
      expect(pie.getSection('B')).toBeDefined();
    });

    it('should update section value', () => {
      const pie = Pie.create().addSection('A', 30).updateSection('A', 70);
      expect(pie.getSection('A')?.value).toBe(70);
    });

    it('should get section by label', () => {
      const pie = Pie.create().addSection('Test', 42);
      const section = pie.getSection('Test');
      expect(section).toBeDefined();
      expect(section?.label).toBe('Test');
      expect(section?.value).toBe(42);
    });

    it('should return undefined for non-existent section', () => {
      const pie = Pie.create();
      expect(pie.getSection('NonExistent')).toBeUndefined();
    });

    it('should get all sections', () => {
      const pie = Pie.create().addSection('A', 30).addSection('B', 70);
      const sections = pie.getSections();
      expect(sections.length).toBe(2);
    });

    it('should return section count', () => {
      const pie = Pie.create().addSection('A', 50).addSection('B', 50);
      expect(pie.sectionCount).toBe(2);
    });
  });

  describe('Query Operations', () => {
    it('should find sections by label', () => {
      const pie = Pie.create().addSection('Apples', 30).addSection('Bananas', 70);
      const sections = pie.findSections({ label: 'Apples' });
      expect(sections.length).toBe(1);
      expect(sections[0].label).toBe('Apples');
    });

    it('should find sections by minimum value', () => {
      const pie = Pie.create().addSection('A', 10).addSection('B', 30).addSection('C', 60);
      const sections = pie.findSections({ minValue: 25 });
      expect(sections.length).toBe(2);
    });

    it('should find sections by maximum value', () => {
      const pie = Pie.create().addSection('A', 10).addSection('B', 30).addSection('C', 60);
      const sections = pie.findSections({ maxValue: 35 });
      expect(sections.length).toBe(2);
    });

    it('should find sections by value range', () => {
      const pie = Pie.create().addSection('A', 10).addSection('B', 30).addSection('C', 60);
      const sections = pie.findSections({ minValue: 20, maxValue: 40 });
      expect(sections.length).toBe(1);
      expect(sections[0].label).toBe('B');
    });

    it('should get total value', () => {
      const pie = Pie.create().addSection('A', 30).addSection('B', 70);
      expect(pie.getTotal()).toBe(100);
    });

    it('should get percentage of section', () => {
      const pie = Pie.create().addSection('A', 25).addSection('B', 75);
      expect(pie.getPercentage('A')).toBe(25);
      expect(pie.getPercentage('B')).toBe(75);
    });

    it('should return undefined percentage for non-existent section', () => {
      const pie = Pie.create();
      expect(pie.getPercentage('NonExistent')).toBeUndefined();
    });

    it('should get largest section', () => {
      const pie = Pie.create()
        .addSection('Small', 10)
        .addSection('Medium', 30)
        .addSection('Large', 60);
      const largest = pie.getLargestSection();
      expect(largest?.label).toBe('Large');
      expect(largest?.value).toBe(60);
    });

    it('should get smallest section', () => {
      const pie = Pie.create()
        .addSection('Small', 10)
        .addSection('Medium', 30)
        .addSection('Large', 60);
      const smallest = pie.getSmallestSection();
      expect(smallest?.label).toBe('Small');
      expect(smallest?.value).toBe(10);
    });

    it('should return undefined for largest/smallest on empty pie', () => {
      const pie = Pie.create();
      expect(pie.getLargestSection()).toBeUndefined();
      expect(pie.getSmallestSection()).toBeUndefined();
    });
  });

  describe('Accessibility Operations', () => {
    it('should set accessibility title', () => {
      const pie = Pie.create().setAccTitle('Accessible Title');
      expect(pie.getAccTitle()).toBe('Accessible Title');
    });

    it('should set accessibility description', () => {
      const pie = Pie.create().setAccDescr('Accessible Description');
      expect(pie.getAccDescr()).toBe('Accessible Description');
    });
  });

  describe('Complex Scenarios', () => {
    it('should build complete pie chart', () => {
      const pie = Pie.create()
        .setTitle('Browser Market Share')
        .setShowData(true)
        .addSection('Chrome', 65)
        .addSection('Safari', 19)
        .addSection('Firefox', 10)
        .addSection('Edge', 4)
        .addSection('Other', 2);

      const ast = pie.toAST();
      expect(ast.title).toBe('Browser Market Share');
      expect(ast.showData).toBe(true);
      expect(ast.sections.length).toBe(5);
      expect(pie.getTotal()).toBe(100);
    });

    it('should handle decimal values', () => {
      const pie = Pie.create().addSection('A', 33.33).addSection('B', 33.33).addSection('C', 33.34);
      expect(pie.getTotal()).toBeCloseTo(100, 2);
    });
  });
});
