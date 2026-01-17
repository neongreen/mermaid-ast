/**
 * ER Diagram Parser
 *
 * Parses Mermaid ER diagram syntax into an AST using the vendored JISON parser.
 */

import type {
  ErAttribute,
  ErCardinality,
  ErDiagramAST,
  ErDirection,
  ErIdentification,
  ErRelSpec,
} from '../types/er.js';
import { createEmptyErDiagramAST } from '../types/er.js';

// @ts-expect-error - JISON parser has no types
import erParser from '../vendored/parsers/er.js';

/**
 * Cardinality enum for the yy object
 */
const Cardinality = {
  ZERO_OR_ONE: 'ZERO_OR_ONE' as ErCardinality,
  ZERO_OR_MORE: 'ZERO_OR_MORE' as ErCardinality,
  ONE_OR_MORE: 'ONE_OR_MORE' as ErCardinality,
  ONLY_ONE: 'ONLY_ONE' as ErCardinality,
  MD_PARENT: 'MD_PARENT' as ErCardinality,
};

/**
 * Identification enum for the yy object
 */
const Identification = {
  IDENTIFYING: 'IDENTIFYING' as ErIdentification,
  NON_IDENTIFYING: 'NON_IDENTIFYING' as ErIdentification,
};

/**
 * Create the yy object that the JISON parser uses to build the AST
 */
function createErYY(ast: ErDiagramAST) {
  return {
    Cardinality,
    Identification,

    addEntity(name: string, alias?: string): void {
      if (!ast.entities.has(name)) {
        ast.entities.set(name, {
          name,
          alias,
          attributes: [],
        });
      } else if (alias && !ast.entities.get(name)!.alias) {
        ast.entities.get(name)!.alias = alias;
      }
    },

    addAttributes(
      entityName: string,
      attributes: Array<{
        type: string;
        name: string;
        keys?: string[];
        comment?: string;
      }>
    ): void {
      const entity = ast.entities.get(entityName);
      if (entity) {
        // JISON grammar builds attributes in reverse order, so we reverse them here
        const reversed = [...attributes].reverse();
        for (const attr of reversed) {
          entity.attributes.push({
            type: attr.type,
            name: attr.name,
            keys: attr.keys as ErAttribute['keys'],
            comment: attr.comment,
          });
        }
      }
    },

    addRelationship(entityA: string, role: string, entityB: string, relSpec: ErRelSpec): void {
      ast.relationships.push({
        entityA,
        entityB,
        relSpec,
        role,
      });
    },

    setClass(entities: string[], classNames: string[]): void {
      for (const entity of entities) {
        const existing = ast.classes.get(entity) || [];
        ast.classes.set(entity, [...existing, ...classNames]);
      }
    },

    addClass(classNames: string[], styles: string[]): void {
      for (const className of classNames) {
        ast.classDefs.set(className, {
          name: className,
          styles,
        });
      }
    },

    addCssStyles(ids: string[], styles: string[]): void {
      for (const id of ids) {
        const existing = ast.styles.get(id) || [];
        ast.styles.set(id, [...existing, ...styles]);
      }
    },

    setDirection(direction: string): void {
      ast.direction = direction as ErDirection;
    },

    setAccTitle(title: string): void {
      ast.accTitle = title;
    },

    setAccDescription(description: string): void {
      ast.accDescription = description;
    },

    // Required by parser but not used
    clear(): void {},
    setDiagramTitle(): void {},
  };
}

/**
 * Parse ER diagram syntax into an AST
 * @param input - Mermaid ER diagram syntax
 * @returns The parsed AST
 */
export function parseErDiagram(input: string): ErDiagramAST {
  const ast = createEmptyErDiagramAST();

  // Normalize input - ensure it starts with erDiagram
  let normalizedInput = input.trim();
  if (!normalizedInput.toLowerCase().startsWith('erdiagram')) {
    normalizedInput = `erDiagram\n${normalizedInput}`;
  }

  // Set up the yy object
  erParser.yy = createErYY(ast);

  // Parse the input
  erParser.parse(normalizedInput);

  return ast;
}

/**
 * Check if input is an ER diagram
 */
export function isErDiagram(input: string): boolean {
  const trimmed = input.trim();
  const firstLine = trimmed.split('\n')[0].trim().toLowerCase();
  return firstLine.startsWith('erdiagram') || firstLine.startsWith('er-diagram');
}
