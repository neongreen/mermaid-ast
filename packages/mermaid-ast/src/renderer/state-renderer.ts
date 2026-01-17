/**
 * State Diagram Renderer
 *
 * Renders a State Diagram AST back to Mermaid syntax.
 */

import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';
import type { StateDefinition, StateDiagramAST, StateTransition } from '../types/state.js';
import { block, type Doc, indent, render, when } from './doc.js';

/**
 * Render a state ID, handling special start/end state
 */
function renderStateId(id: string): string {
  if (id === '[*]') {
    return '[*]';
  }
  return id;
}

/**
 * Render a state definition to Doc
 */
function renderState(state: StateDefinition): Doc {
  const id = renderStateId(state.id);

  // Handle special state types
  if (state.type === 'fork') {
    return `state ${id} <<fork>>`;
  }
  if (state.type === 'join') {
    return `state ${id} <<join>>`;
  }
  if (state.type === 'choice') {
    return `state ${id} <<choice>>`;
  }
  if (state.type === 'divider') {
    // Dividers are rendered as --
    return null;
  }

  // Skip [*] states - they're implicit
  if (id === '[*]') {
    return null;
  }

  // Handle composite states (states with nested doc)
  if (state.doc && state.doc.length > 0) {
    const desc = state.description
      ? typeof state.description === 'string'
        ? state.description
        : state.description[0]
      : '';

    if (desc) {
      return block(`state "${desc}" as ${id} {`, [], '}');
    }
    return block(`state ${id} {`, [], '}');
  }

  // Handle state with description
  if (state.description) {
    const desc = typeof state.description === 'string' ? state.description : state.description[0];
    return `state "${desc}" as ${id}`;
  }

  return null;
}

/**
 * Render a state note to Doc
 */
function renderStateNote(state: StateDefinition): Doc {
  if (state.note) {
    return `note ${state.note.position} ${state.id} : ${state.note.text}`;
  }
  return null;
}

/**
 * Render a transition to string
 */
function renderTransition(transition: StateTransition): string {
  const from = renderStateId(transition.state1.id);
  const to = renderStateId(transition.state2.id);

  if (transition.description) {
    return `${from} --> ${to} : ${transition.description}`;
  }
  return `${from} --> ${to}`;
}

/**
 * Render a State Diagram AST to Mermaid syntax
 */
export function renderStateDiagram(ast: StateDiagramAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);

  // Build the document
  const doc: Doc = [
    'stateDiagram-v2',
    indent([
      // Direction if not default
      when(ast.direction && ast.direction !== 'TB', `direction ${ast.direction}`),

      // Class definitions
      ...[...ast.classDefs.values()].map(
        (classDef) => `classDef ${classDef.id} ${classDef.classes}`
      ),

      // States that need explicit declaration (special types or descriptions)
      ...[...ast.states.entries()]
        .filter(([id, state]) => {
          if (id === '[*]') return false;
          if (state.type === 'fork' || state.type === 'join' || state.type === 'choice')
            return true;
          if (state.description) return true;
          return false;
        })
        .map(([, state]) => renderState(state)),

      // State notes
      ...[...ast.states.entries()]
        .filter(([id, state]) => id !== '[*]' && state.note)
        .map(([, state]) => renderStateNote(state)),

      // Transitions
      ...ast.transitions.map(renderTransition),

      // Style definitions
      ...ast.styles.map((style) => `style ${style.id} ${style.styleClass}`),

      // Class applications
      ...ast.classApplications.map((app) => `class ${app.id} ${app.styleClass}`),

      // Click handlers
      ...ast.clicks.map((click) => {
        if (click.url) {
          if (click.tooltip) {
            return `click ${click.id} href "${click.url}" "${click.tooltip}"`;
          }
          return `click ${click.id} href "${click.url}"`;
        }
        return null;
      }),
    ]),
  ];

  return render(doc, opts.indent);
}
