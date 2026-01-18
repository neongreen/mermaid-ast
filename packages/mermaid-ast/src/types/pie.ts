/**
 * Pie Chart AST Types
 *
 * Represents the structure of a Mermaid pie chart diagram.
 * Uses @mermaid-js/parser (Langium-based) for parsing.
 */

/**
 * A section/slice in a pie chart
 */
export interface PieSection {
  /** Label for this section */
  label: string;
  /** Numeric value for this section */
  value: number;
}

/**
 * AST for a Mermaid pie chart
 */
export interface PieAST {
  /** Discriminator for AST type */
  type: 'pie';
  /** Optional title for the pie chart */
  title?: string;
  /** Whether to show data values on the chart */
  showData: boolean;
  /** Sections/slices of the pie chart */
  sections: PieSection[];
  /** Accessibility title */
  accTitle?: string;
  /** Accessibility description */
  accDescr?: string;
}

/**
 * Creates an empty Pie AST
 */
export function createEmptyPieAST(): PieAST {
  return {
    type: 'pie',
    showData: false,
    sections: [],
  };
}
