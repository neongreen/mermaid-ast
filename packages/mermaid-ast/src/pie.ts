/**
 * Pie Chart Wrapper Class
 *
 * Provides a fluent API for building and manipulating pie charts.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parsePie } from './parser/pie-parser.js';
import { renderPie } from './renderer/pie-renderer.js';
import type { PieAST, PieSection } from './types/pie.js';
import { createEmptyPieAST } from './types/pie.js';
import type { RenderOptions } from './types/render-options.js';

/**
 * Options for adding a section
 */
export interface AddSectionOptions {
  /** Label for the section */
  label: string;
  /** Value for the section */
  value: number;
}

/**
 * Query options for finding sections
 */
export interface FindSectionsQuery {
  /** Filter by label (exact match) */
  label?: string;
  /** Filter by minimum value */
  minValue?: number;
  /** Filter by maximum value */
  maxValue?: number;
}

/**
 * Pie chart wrapper class
 */
export class Pie extends DiagramWrapper<PieAST> {
  private constructor(ast: PieAST) {
    super(ast);
  }

  // ============================================
  // Factory Methods
  // ============================================

  /**
   * Creates an empty pie chart
   */
  static create(): Pie {
    return new Pie(createEmptyPieAST());
  }

  /**
   * Creates a Pie wrapper from an existing AST
   */
  static from(ast: PieAST): Pie {
    return new Pie(structuredClone(ast));
  }

  /**
   * Parses Mermaid pie chart syntax into a Pie wrapper
   *
   * Note: This is an async method because the underlying parser is async.
   */
  static async parse(text: string): Promise<Pie> {
    const ast = await parsePie(text);
    return new Pie(ast);
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Renders the pie chart to Mermaid syntax
   */
  render(options?: RenderOptions): string {
    return renderPie(this.ast, options);
  }

  /**
   * Creates a deep clone of this pie chart
   */
  clone(): Pie {
    return new Pie(structuredClone(this.ast));
  }

  // ============================================
  // Title Operations
  // ============================================

  /**
   * Sets the title of the pie chart
   */
  setTitle(title: string): this {
    this.ast.title = title;
    return this;
  }

  /**
   * Gets the title of the pie chart
   */
  getTitle(): string | undefined {
    return this.ast.title;
  }

  /**
   * Removes the title
   */
  removeTitle(): this {
    this.ast.title = undefined;
    return this;
  }

  // ============================================
  // ShowData Operations
  // ============================================

  /**
   * Sets whether to show data values
   */
  setShowData(show: boolean): this {
    this.ast.showData = show;
    return this;
  }

  /**
   * Gets whether data values are shown
   */
  getShowData(): boolean {
    return this.ast.showData;
  }

  // ============================================
  // Section Operations
  // ============================================

  /**
   * Adds a section to the pie chart
   */
  addSection(label: string, value: number): this {
    this.ast.sections.push({ label, value });
    return this;
  }

  /**
   * Removes a section by label
   */
  removeSection(label: string): this {
    this.ast.sections = this.ast.sections.filter((s) => s.label !== label);
    return this;
  }

  /**
   * Updates a section's value
   */
  updateSection(label: string, value: number): this {
    const section = this.ast.sections.find((s) => s.label === label);
    if (section) {
      section.value = value;
    }
    return this;
  }

  /**
   * Gets a section by label
   */
  getSection(label: string): PieSection | undefined {
    return this.ast.sections.find((s) => s.label === label);
  }

  /**
   * Gets all sections
   */
  getSections(): PieSection[] {
    return [...this.ast.sections];
  }

  /**
   * Gets the number of sections
   */
  get sectionCount(): number {
    return this.ast.sections.length;
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Finds sections matching the query
   */
  findSections(query: FindSectionsQuery): PieSection[] {
    return this.ast.sections.filter((section) => {
      if (query.label !== undefined && section.label !== query.label) {
        return false;
      }
      if (query.minValue !== undefined && section.value < query.minValue) {
        return false;
      }
      if (query.maxValue !== undefined && section.value > query.maxValue) {
        return false;
      }
      return true;
    });
  }

  /**
   * Gets the total value of all sections
   */
  getTotal(): number {
    return this.ast.sections.reduce((sum, s) => sum + s.value, 0);
  }

  /**
   * Gets the percentage of a section
   */
  getPercentage(label: string): number | undefined {
    const section = this.getSection(label);
    if (!section) return undefined;
    const total = this.getTotal();
    if (total === 0) return 0;
    return (section.value / total) * 100;
  }

  /**
   * Gets the section with the largest value
   */
  getLargestSection(): PieSection | undefined {
    if (this.ast.sections.length === 0) return undefined;
    return this.ast.sections.reduce((max, s) => (s.value > max.value ? s : max));
  }

  /**
   * Gets the section with the smallest value
   */
  getSmallestSection(): PieSection | undefined {
    if (this.ast.sections.length === 0) return undefined;
    return this.ast.sections.reduce((min, s) => (s.value < min.value ? s : min));
  }

  // ============================================
  // Accessibility Operations
  // ============================================

  /**
   * Sets the accessibility title
   */
  setAccTitle(title: string): this {
    this.ast.accTitle = title;
    return this;
  }

  /**
   * Gets the accessibility title
   */
  getAccTitle(): string | undefined {
    return this.ast.accTitle;
  }

  /**
   * Sets the accessibility description
   */
  setAccDescr(descr: string): this {
    this.ast.accDescr = descr;
    return this;
  }

  /**
   * Gets the accessibility description
   */
  getAccDescr(): string | undefined {
    return this.ast.accDescr;
  }
}
