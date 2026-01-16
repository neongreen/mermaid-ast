/**
 * State Diagram Renderer
 *
 * Renders a State Diagram AST back to Mermaid syntax.
 */

import type {
  StateDiagramAST,
  StateDefinition,
  StateTransition,
  StateDirection,
} from "../types/state.js";

/**
 * Render a state ID, handling special start/end state
 */
function renderStateId(id: string): string {
  if (id === "[*]") {
    return "[*]";
  }
  return id;
}

/**
 * Render a state definition
 */
function renderState(
  state: StateDefinition,
  indent: string = "    "
): string[] {
  const lines: string[] = [];
  const id = renderStateId(state.id);

  // Handle special state types
  if (state.type === "fork") {
    lines.push(`${indent}state ${id} <<fork>>`);
    return lines;
  }
  if (state.type === "join") {
    lines.push(`${indent}state ${id} <<join>>`);
    return lines;
  }
  if (state.type === "choice") {
    lines.push(`${indent}state ${id} <<choice>>`);
    return lines;
  }
  if (state.type === "divider") {
    // Dividers are rendered as --
    return lines;
  }

  // Skip [*] states - they're implicit
  if (id === "[*]") {
    return lines;
  }

  // Handle composite states (states with nested doc)
  if (state.doc && state.doc.length > 0) {
    const desc = state.description
      ? typeof state.description === "string"
        ? state.description
        : state.description[0]
      : "";

    if (desc) {
      lines.push(`${indent}state "${desc}" as ${id} {`);
    } else {
      lines.push(`${indent}state ${id} {`);
    }

    // We don't render nested states here - they'll be rendered via transitions
    lines.push(`${indent}}`);
    return lines;
  }

  // Handle state with description
  if (state.description) {
    const desc =
      typeof state.description === "string"
        ? state.description
        : state.description[0];
    lines.push(`${indent}state "${desc}" as ${id}`);
    return lines;
  }

  // Handle note
  if (state.note) {
    lines.push(
      `${indent}note ${state.note.position} ${id} : ${state.note.text}`
    );
  }

  return lines;
}

/**
 * Render a transition
 */
function renderTransition(
  transition: StateTransition,
  indent: string = "    "
): string {
  const from = renderStateId(transition.state1.id);
  const to = renderStateId(transition.state2.id);

  if (transition.description) {
    return `${indent}${from} --> ${to} : ${transition.description}`;
  }
  return `${indent}${from} --> ${to}`;
}

/**
 * Render a State Diagram AST to Mermaid syntax
 */
export function renderStateDiagram(ast: StateDiagramAST): string {
  const lines: string[] = [];

  // Header
  lines.push("stateDiagram-v2");

  // Direction if not default
  if (ast.direction && ast.direction !== "TB") {
    lines.push(`    direction ${ast.direction}`);
  }

  // Render class definitions
  for (const [, classDef] of ast.classDefs) {
    lines.push(`    classDef ${classDef.id} ${classDef.classes}`);
  }

  // Collect states that need explicit declaration
  // (states with descriptions, special types, or notes that aren't in transitions)
  const statesInTransitions = new Set<string>();
  for (const t of ast.transitions) {
    statesInTransitions.add(t.state1.id);
    statesInTransitions.add(t.state2.id);
  }

  // Render states that need explicit declaration
  for (const [id, state] of ast.states) {
    // Skip [*] - it's implicit
    if (id === "[*]") continue;

    // Render special types
    if (state.type === "fork" || state.type === "join" || state.type === "choice") {
      lines.push(...renderState(state));
      continue;
    }

    // Render states with descriptions
    if (state.description) {
      lines.push(...renderState(state));
      continue;
    }

    // Render notes
    if (state.note) {
      lines.push(
        `    note ${state.note.position} ${id} : ${state.note.text}`
      );
    }
  }

  // Render transitions
  for (const transition of ast.transitions) {
    lines.push(renderTransition(transition));
  }

  // Render style definitions
  for (const style of ast.styles) {
    lines.push(`    style ${style.id} ${style.styleClass}`);
  }

  // Render class applications
  for (const app of ast.classApplications) {
    lines.push(`    class ${app.id} ${app.styleClass}`);
  }

  // Render click handlers
  for (const click of ast.clicks) {
    if (click.url) {
      if (click.tooltip) {
        lines.push(`    click ${click.id} href "${click.url}" "${click.tooltip}"`);
      } else {
        lines.push(`    click ${click.id} href "${click.url}"`);
      }
    }
  }

  return lines.join("\n");
}