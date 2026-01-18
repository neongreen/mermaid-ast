/**
 * C4 Diagram Parser
 *
 * Parses C4 diagram syntax into C4AST using the vendored JISON parser.
 */

// @ts-expect-error - JISON parser has no types
import c4Parser from '../vendored/parsers/c4.js';
import {
  type C4AST,
  type C4Boundary,
  type C4BoundaryType,
  type C4Component,
  type C4ComponentType,
  type C4Container,
  type C4ContainerType,
  type C4DeploymentNode,
  type C4DeploymentNodeType,
  type C4DiagramType,
  type C4Direction,
  type C4Element,
  type C4ElementStyle,
  type C4LayoutConfig,
  type C4Person,
  type C4PersonType,
  type C4Relationship,
  type C4RelationshipStyle,
  type C4RelationType,
  type C4System,
  type C4SystemType,
  createEmptyC4AST,
} from '../types/c4.js';

/**
 * Stack for tracking nested boundaries during parsing
 */
interface BoundaryStackItem {
  boundary: C4Boundary | C4DeploymentNode;
  parent: C4Element[] | null;
}

/**
 * Creates the yy object for the JISON parser
 */
function createC4YY(ast: C4AST) {
  // Stack for nested boundaries
  const boundaryStack: BoundaryStackItem[] = [];

  // Current elements array (top-level or inside a boundary)
  let currentElements: C4Element[] = ast.elements;

  return {
    getLogger: () => ({
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
    }),

    setC4Type: (type: string) => {
      ast.diagramType = type as C4DiagramType;
    },

    setTitle: (title: string) => {
      ast.title = title?.trim();
    },

    getTitle: () => ast.title,

    setAccTitle: (title: string) => {
      ast.accTitle = title?.trim();
    },

    getAccTitle: () => ast.accTitle,

    setAccDescription: (descr: string) => {
      ast.accDescr = descr?.trim();
    },

    getAccDescription: () => ast.accDescr,

    setDirection: (dir: string) => {
      ast.direction = dir as C4Direction;
    },

    /**
     * Add a person or system element
     * Attributes: [alias, label?, description?, sprite?, tags?, link?, ...properties]
     */
    addPersonOrSystem: (type: string, ...attributes: (string | Record<string, string>)[]) => {
      const [alias, label, description, sprite, tags, link, ...rest] = attributes;

      const properties: Record<string, string> = {};
      for (const attr of rest) {
        if (typeof attr === 'object') {
          Object.assign(properties, attr);
        }
      }

      if (type === 'person' || type === 'external_person') {
        const person: C4Person = {
          type: type as C4PersonType,
          alias: String(alias || ''),
          label: label ? String(label) : undefined,
          description: description ? String(description) : undefined,
          sprite: sprite ? String(sprite) : undefined,
          tags: tags ? String(tags) : undefined,
          link: link ? String(link) : undefined,
          properties: Object.keys(properties).length > 0 ? properties : undefined,
        };
        currentElements.push(person);
      } else {
        const system: C4System = {
          type: type as C4SystemType,
          alias: String(alias || ''),
          label: label ? String(label) : undefined,
          description: description ? String(description) : undefined,
          sprite: sprite ? String(sprite) : undefined,
          tags: tags ? String(tags) : undefined,
          link: link ? String(link) : undefined,
          properties: Object.keys(properties).length > 0 ? properties : undefined,
        };
        currentElements.push(system);
      }
    },

    /**
     * Add a container element
     * Attributes: [alias, label?, technology?, description?, sprite?, tags?, link?, ...properties]
     */
    addContainer: (type: string, ...attributes: (string | Record<string, string>)[]) => {
      const [alias, label, technology, description, sprite, tags, link, ...rest] = attributes;

      const properties: Record<string, string> = {};
      for (const attr of rest) {
        if (typeof attr === 'object') {
          Object.assign(properties, attr);
        }
      }

      const container: C4Container = {
        type: type as C4ContainerType,
        alias: String(alias || ''),
        label: label ? String(label) : undefined,
        technology: technology ? String(technology) : undefined,
        description: description ? String(description) : undefined,
        sprite: sprite ? String(sprite) : undefined,
        tags: tags ? String(tags) : undefined,
        link: link ? String(link) : undefined,
        properties: Object.keys(properties).length > 0 ? properties : undefined,
      };
      currentElements.push(container);
    },

    /**
     * Add a component element
     * Attributes: [alias, label?, technology?, description?, sprite?, tags?, link?, ...properties]
     */
    addComponent: (type: string, ...attributes: (string | Record<string, string>)[]) => {
      const [alias, label, technology, description, sprite, tags, link, ...rest] = attributes;

      const properties: Record<string, string> = {};
      for (const attr of rest) {
        if (typeof attr === 'object') {
          Object.assign(properties, attr);
        }
      }

      const component: C4Component = {
        type: type as C4ComponentType,
        alias: String(alias || ''),
        label: label ? String(label) : undefined,
        technology: technology ? String(technology) : undefined,
        description: description ? String(description) : undefined,
        sprite: sprite ? String(sprite) : undefined,
        tags: tags ? String(tags) : undefined,
        link: link ? String(link) : undefined,
        properties: Object.keys(properties).length > 0 ? properties : undefined,
      };
      currentElements.push(component);
    },

    /**
     * Add a person or system boundary
     * Attributes: [alias, label?, boundaryType?, tags?, link?, ...properties]
     */
    addPersonOrSystemBoundary: (...attributes: (string | Record<string, string>)[]) => {
      const [alias, label, boundaryTypeStr, tags, link, ...rest] = attributes;

      const properties: Record<string, string> = {};
      for (const attr of rest) {
        if (typeof attr === 'object') {
          Object.assign(properties, attr);
        }
      }

      // Determine boundary type
      let boundaryType: C4BoundaryType = 'boundary';
      if (boundaryTypeStr === 'ENTERPRISE') {
        boundaryType = 'enterprise_boundary';
      } else if (boundaryTypeStr === 'SYSTEM') {
        boundaryType = 'system_boundary';
      }

      const boundary: C4Boundary = {
        type: boundaryType,
        alias: String(alias || ''),
        label: label ? String(label) : undefined,
        tags: tags ? String(tags) : undefined,
        link: link ? String(link) : undefined,
        properties: Object.keys(properties).length > 0 ? properties : undefined,
        children: [],
      };

      // Add to current elements
      currentElements.push(boundary);

      // Push to stack and switch context
      boundaryStack.push({
        boundary,
        parent: currentElements,
      });
      currentElements = boundary.children;
    },

    /**
     * Add a container boundary
     * Attributes: [alias, label?, boundaryType?, tags?, link?, ...properties]
     */
    addContainerBoundary: (...attributes: (string | Record<string, string>)[]) => {
      const [alias, label, _boundaryType, tags, link, ...rest] = attributes;

      const properties: Record<string, string> = {};
      for (const attr of rest) {
        if (typeof attr === 'object') {
          Object.assign(properties, attr);
        }
      }

      const boundary: C4Boundary = {
        type: 'container_boundary',
        alias: String(alias || ''),
        label: label ? String(label) : undefined,
        tags: tags ? String(tags) : undefined,
        link: link ? String(link) : undefined,
        properties: Object.keys(properties).length > 0 ? properties : undefined,
        children: [],
      };

      // Add to current elements
      currentElements.push(boundary);

      // Push to stack and switch context
      boundaryStack.push({
        boundary,
        parent: currentElements,
      });
      currentElements = boundary.children;
    },

    /**
     * Add a deployment node
     * Attributes: [alias, label?, technology?, description?, sprite?, tags?, link?, ...properties]
     */
    addDeploymentNode: (type: string, ...attributes: (string | Record<string, string>)[]) => {
      const [alias, label, technology, description, sprite, tags, link, ...rest] = attributes;

      const properties: Record<string, string> = {};
      for (const attr of rest) {
        if (typeof attr === 'object') {
          Object.assign(properties, attr);
        }
      }

      const node: C4DeploymentNode = {
        type: type as C4DeploymentNodeType,
        alias: String(alias || ''),
        label: label ? String(label) : undefined,
        technology: technology ? String(technology) : undefined,
        description: description ? String(description) : undefined,
        sprite: sprite ? String(sprite) : undefined,
        tags: tags ? String(tags) : undefined,
        link: link ? String(link) : undefined,
        properties: Object.keys(properties).length > 0 ? properties : undefined,
        children: [],
      };

      // Add to current elements
      currentElements.push(node);

      // Push to stack and switch context
      boundaryStack.push({
        boundary: node,
        parent: currentElements,
      });
      currentElements = node.children;
    },

    /**
     * Pop boundary from stack (called when } is encountered)
     */
    popBoundaryParseStack: () => {
      const item = boundaryStack.pop();
      if (item?.parent) {
        currentElements = item.parent;
      } else {
        currentElements = ast.elements;
      }
    },

    /**
     * Add a relationship
     * Attributes: [from, to, label?, technology?, description?, sprite?, tags?, link?, ...properties]
     */
    addRel: (type: string, ...attributes: (string | Record<string, string>)[]) => {
      const [from, to, label, technology, description, sprite, tags, link, ...rest] = attributes;

      const properties: Record<string, string> = {};
      for (const attr of rest) {
        if (typeof attr === 'object') {
          Object.assign(properties, attr);
        }
      }

      const rel: C4Relationship = {
        type: type as C4RelationType,
        from: String(from || ''),
        to: String(to || ''),
        label: label ? String(label) : undefined,
        technology: technology ? String(technology) : undefined,
        description: description ? String(description) : undefined,
        sprite: sprite ? String(sprite) : undefined,
        tags: tags ? String(tags) : undefined,
        link: link ? String(link) : undefined,
        properties: Object.keys(properties).length > 0 ? properties : undefined,
      };
      ast.relationships.push(rel);
    },

    /**
     * Update element style
     * Attributes: [elementName, bgColor?, fontColor?, borderColor?, shadowing?, shape?, sprite?, technology?, legendText?, legendSprite?]
     */
    updateElStyle: (_type: string, ...attributes: string[]) => {
      const [
        elementName,
        bgColor,
        fontColor,
        borderColor,
        shadowing,
        shape,
        sprite,
        technology,
        legendText,
        legendSprite,
      ] = attributes;

      const style: C4ElementStyle = {
        elementName: String(elementName || ''),
        bgColor: bgColor || undefined,
        fontColor: fontColor || undefined,
        borderColor: borderColor || undefined,
        shadowing: shadowing || undefined,
        shape: shape || undefined,
        sprite: sprite || undefined,
        technology: technology || undefined,
        legendText: legendText || undefined,
        legendSprite: legendSprite || undefined,
      };
      ast.elementStyles.push(style);
    },

    /**
     * Update relationship style
     * Attributes: [from, to, textColor?, lineColor?, offsetX?, offsetY?]
     */
    updateRelStyle: (_type: string, ...attributes: string[]) => {
      const [from, to, textColor, lineColor, offsetX, offsetY] = attributes;

      const style: C4RelationshipStyle = {
        from: String(from || ''),
        to: String(to || ''),
        textColor: textColor || undefined,
        lineColor: lineColor || undefined,
        offsetX: offsetX ? Number.parseInt(offsetX, 10) : undefined,
        offsetY: offsetY ? Number.parseInt(offsetY, 10) : undefined,
      };
      ast.relationshipStyles.push(style);
    },

    /**
     * Update layout config
     * Attributes can be key-value objects like {c4ShapeInRow: "3"} or simple strings
     */
    updateLayoutConfig: (_type: string, ...attributes: (string | Record<string, string>)[]) => {
      // Extract values from key-value objects or simple strings
      let c4ShapeInRow: string | undefined;
      let c4BoundaryInRow: string | undefined;

      for (const attr of attributes) {
        if (typeof attr === 'object') {
          if ('c4ShapeInRow' in attr) {
            c4ShapeInRow = attr.c4ShapeInRow;
          }
          if ('c4BoundaryInRow' in attr) {
            c4BoundaryInRow = attr.c4BoundaryInRow;
          }
        }
      }

      // Fall back to positional arguments if no key-value objects found
      if (!c4ShapeInRow && !c4BoundaryInRow && attributes.length > 0) {
        const [first, second] = attributes;
        if (typeof first === 'string') c4ShapeInRow = first;
        if (typeof second === 'string') c4BoundaryInRow = second;
      }

      ast.layoutConfig = {
        c4ShapeInRow: c4ShapeInRow ? Number.parseInt(c4ShapeInRow, 10) : undefined,
        c4BoundaryInRow: c4BoundaryInRow ? Number.parseInt(c4BoundaryInRow, 10) : undefined,
      };
    },

    clear: () => {
      ast.elements = [];
      ast.relationships = [];
      ast.elementStyles = [];
      ast.relationshipStyles = [];
      ast.layoutConfig = undefined;
      ast.title = undefined;
      ast.accTitle = undefined;
      ast.accDescr = undefined;
      ast.direction = undefined;
      boundaryStack.length = 0;
      currentElements = ast.elements;
    },
  };
}

/**
 * Detects if the input is a C4 diagram
 */
export function isC4Diagram(input: string): boolean {
  const trimmed = input.trim();
  return (
    trimmed.startsWith('C4Context') ||
    trimmed.startsWith('C4Container') ||
    trimmed.startsWith('C4Component') ||
    trimmed.startsWith('C4Dynamic') ||
    trimmed.startsWith('C4Deployment')
  );
}

/**
 * Parses C4 diagram syntax into C4AST
 */
export function parseC4(input: string): C4AST {
  // Detect diagram type from input
  const trimmed = input.trim();
  let diagramType: C4DiagramType = 'C4Context';

  if (trimmed.startsWith('C4Context')) {
    diagramType = 'C4Context';
  } else if (trimmed.startsWith('C4Container')) {
    diagramType = 'C4Container';
  } else if (trimmed.startsWith('C4Component')) {
    diagramType = 'C4Component';
  } else if (trimmed.startsWith('C4Dynamic')) {
    diagramType = 'C4Dynamic';
  } else if (trimmed.startsWith('C4Deployment')) {
    diagramType = 'C4Deployment';
  }

  const ast = createEmptyC4AST(diagramType);

  // Normalize input - ensure newline after header
  let normalizedInput = trimmed;
  const headerMatch = normalizedInput.match(
    /^(C4Context|C4Container|C4Component|C4Dynamic|C4Deployment)/
  );
  if (headerMatch) {
    const header = headerMatch[1];
    const rest = normalizedInput.slice(header.length);
    if (!rest.startsWith('\n') && !rest.startsWith('\r')) {
      normalizedInput = `${header}\n${rest}`;
    }
  }

  // Set up parser
  c4Parser.yy = createC4YY(ast);

  try {
    c4Parser.parse(normalizedInput);
  } catch (e) {
    // If parsing fails, return the AST with whatever was parsed
    console.error('C4 diagram parsing error:', e);
  }

  return ast;
}
