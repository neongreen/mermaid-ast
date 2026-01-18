/**
 * Pie Chart Renderer Tests
 */

import { describe, expect, it } from 'bun:test';
import { renderPie } from '../../src/renderer/pie-renderer.js';
import type { PieAST } from '../../src/types/index.js';

describe('Pie Renderer', () => {
  describe('Basic Rendering', () => {
    it('should render empty pie chart', () => {
      const ast: PieAST = {
        type: 'pie',
        showData: false,
        sections: [],
      };
      const output = renderPie(ast);
      expect(output).toBe('pie');
    });

    it('should render pie chart with sections', () => {
      const ast: PieAST = {
        type: 'pie',
        showData: false,
        sections: [
          { label: 'A', value: 30 },
          { label: 'B', value: 70 },
        ],
      };
      const output = renderPie(ast);
      expect(output).toContain('pie');
      expect(output).toContain('"A" : 30');
      expect(output).toContain('"B" : 70');
    });

    it('should render pie chart with title', () => {
      const ast: PieAST = {
        type: 'pie',
        title: 'My Chart',
        showData: false,
        sections: [],
      };
      const output = renderPie(ast);
      expect(output).toContain('pie');
      expect(output).toContain('title My Chart');
    });

    it('should render pie chart with showData', () => {
      const ast: PieAST = {
        type: 'pie',
        showData: true,
        sections: [],
      };
      const output = renderPie(ast);
      expect(output).toContain('pie showData');
    });

    it('should render pie chart with showData and title', () => {
      const ast: PieAST = {
        type: 'pie',
        title: 'Sales',
        showData: true,
        sections: [
          { label: 'Q1', value: 25 },
          { label: 'Q2', value: 75 },
        ],
      };
      const output = renderPie(ast);
      expect(output).toContain('pie showData');
      expect(output).toContain('title Sales');
      expect(output).toContain('"Q1" : 25');
      expect(output).toContain('"Q2" : 75');
    });
  });

  describe('Section Rendering', () => {
    it('should render integer values', () => {
      const ast: PieAST = {
        type: 'pie',
        showData: false,
        sections: [{ label: 'Test', value: 100 }],
      };
      const output = renderPie(ast);
      expect(output).toContain('"Test" : 100');
    });

    it('should render decimal values', () => {
      const ast: PieAST = {
        type: 'pie',
        showData: false,
        sections: [{ label: 'Test', value: 33.33 }],
      };
      const output = renderPie(ast);
      expect(output).toContain('"Test" : 33.33');
    });

    it('should render labels with spaces', () => {
      const ast: PieAST = {
        type: 'pie',
        showData: false,
        sections: [{ label: 'Category One', value: 50 }],
      };
      const output = renderPie(ast);
      expect(output).toContain('"Category One" : 50');
    });

    it('should render many sections', () => {
      const ast: PieAST = {
        type: 'pie',
        showData: false,
        sections: [
          { label: 'A', value: 10 },
          { label: 'B', value: 10 },
          { label: 'C', value: 10 },
          { label: 'D', value: 10 },
          { label: 'E', value: 10 },
        ],
      };
      const output = renderPie(ast);
      expect(output).toContain('"A" : 10');
      expect(output).toContain('"E" : 10');
    });
  });

  describe('Accessibility Rendering', () => {
    it('should render accessibility title', () => {
      const ast: PieAST = {
        type: 'pie',
        showData: false,
        sections: [],
        accTitle: 'Accessible Title',
      };
      const output = renderPie(ast);
      expect(output).toContain('accTitle: Accessible Title');
    });

    it('should render accessibility description', () => {
      const ast: PieAST = {
        type: 'pie',
        showData: false,
        sections: [],
        accDescr: 'Accessible Description',
      };
      const output = renderPie(ast);
      expect(output).toContain('accDescr: Accessible Description');
    });
  });

  describe('Render Options', () => {
    it('should accept render options', () => {
      const ast: PieAST = {
        type: 'pie',
        showData: false,
        sections: [{ label: 'A', value: 100 }],
      };
      // Pie charts don't have indented content, but should accept options without error
      const output = renderPie(ast, { indent: 2 });
      expect(output).toContain('"A" : 100');
    });
  });

  describe('Complete Pie Charts', () => {
    it('should render complete pie chart', () => {
      const ast: PieAST = {
        type: 'pie',
        title: 'Browser Market Share',
        showData: true,
        sections: [
          { label: 'Chrome', value: 65 },
          { label: 'Safari', value: 19 },
          { label: 'Firefox', value: 10 },
          { label: 'Edge', value: 4 },
          { label: 'Other', value: 2 },
        ],
        accTitle: 'Browser usage statistics',
        accDescr: 'A pie chart showing browser market share',
      };
      const output = renderPie(ast);
      expect(output).toContain('pie showData');
      expect(output).toContain('accTitle: Browser usage statistics');
      expect(output).toContain('accDescr: A pie chart showing browser market share');
      expect(output).toContain('title Browser Market Share');
      expect(output).toContain('"Chrome" : 65');
      expect(output).toContain('"Other" : 2');
    });
  });
});
