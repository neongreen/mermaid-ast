/**
 * State Diagram Renderer
 *
 * Renders a State Diagram AST back to Mermaid syntax.
 */

import type {
  StateApplyClass,
  StateClassDef,
  StateClick,
  StateDefinition,
  StateDiagramAST,
  StateNote,
  StateStyleDef,
  StateTransition,
  StateType,
} from '../types/state.js';
import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';
import type { Doc } from './doc.js';
import { block, indent, render, when } from './doc.js';

/**
 * Render state type annotation
 */
function renderStateType(type: StateType): string | null {
  switch (type) {
    case 'fork':
      return '<<fork>>';
    case 'join':
      return '<<join>>';
    case 'choice':
      return '<<choice>>';
    case 'divider':
      return null; // Dividers are rendered as ---
    case 'default':
    default:
      return null;
  }
}

/**
 * Render a state ID, handling special states
 */
function renderStateId(state: StateDefinition): string {
  if (state.id === '[*]') {
    return '[*]';
  }
  return state.id;
}

/**
 * Render a state definition
 */
function renderState(state: StateDefinition, statesInTransitions: Set<string>): Doc {
  const id = renderStateId(state);
  const typeAnnotation = renderStateType(state.type);

  // Handle composite states (states with nested doc)
  if (state.doc && state.doc.length > 0) {
    const nestedContent: Doc = [];
    for (const stmt of state.doc) {
      if (stmt.stmt === 'state') {
        const nestedState = renderState(stmt.state, statesInTransitions);
        if (nestedState) nestedContent.push(nestedState);
      } else if (stmt.stmt === 'relation') {
        nestedContent.push(renderTransition(stmt.transition));
      } else if (stmt.stmt === 'dir') {
        nestedContent.push(`direction ${stmt.value}`);
      }
    }
    return block(`state ${id} {`, nestedContent, '}');
  }

  // Handle state type annotations (fork, join, choice)
  if (typeAnnotation) {
    return `state ${id} ${typeAnnotation}`;
  }

  // Handle state with description
  if (state.description) {
    const desc = Array.isArray(state.description)
      ? state.description.join('\\n')
      : state.description;
    return `${id} : ${desc}`;
  }

  // Simple state - only declare if not referenced in transitions
  if (!statesInTransitions.has(state.id) && state.id !== '[*]') {
    return `state ${id}`;
  }

  return null;
}

/**
 * Render a transition
 */
function renderTransition(transition: StateTransition): string {
  const from = renderStateId(transition.state1);
  const to = renderStateId(transition.state2);

  if (transition.description) {
    return `${from} --> ${to} : ${transition.description}`;
  }
  return `${from} --> ${to}`;
}

/**
 * Render a note
 */
function renderNote(state: StateDefinition): Doc {
  if (!state.note) return null;
  return `note ${state.note.position} ${state.id} : ${state.note.text}`;
}

/**
 * Render class definitions
 */
function renderClassDefs(classDefs: Map<string, StateClassDef>): Doc {
  return [...classDefs.entries()].map(([, def]) => `classDef ${def.id} ${def.classes}`);
}

/**
 * Render style definitions
 */
function renderStyles(styles: StateStyleDef[]): Doc {
  return styles.map((style) => `style ${style.id} ${style.styleClass}`);
}

/**
 * Render class applications
 */
function renderClassApplications(applications: StateApplyClass[]): Doc {
  return applications.map((app) => `class ${app.id} ${app.styleClass}`);
}

/**
 * Render click handlers
 */
function renderClicks(clicks: StateClick[]): Doc {
  return clicks
    .map((click) => {
      if (click.url) {
        const tooltip = click.tooltip ? ` "${click.tooltip}"` : '';
        return `click ${click.id} href "${click.url}"${tooltip}`;
      }
      return null;
    })
    .filter(Boolean);
}

/**
 * Render a StateDiagramAST to Mermaid syntax
 */
export function renderStateDiagram(ast: StateDiagramAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);

  // Track states referenced in transitions
  const statesInTransitions = new Set<string>();
  for (const transition of ast.transitions) {
    statesInTransitions.add(transition.state1.id);
    statesInTransitions.add(transition.state2.id);
  }

  // Get states (optionally sorted)
  const stateEntries = [...ast.states.entries()];
  if (opts.sortNodes) {
    stateEntries.sort((a, b) => a[0].localeCompare(b[0]));
  }

  // Build the document
  const doc: Doc = [
    'stateDiagram-v2',
    indent([
      // Direction
      when(ast.direction && ast.direction !== 'TB', `direction ${ast.direction}`),

      // Accessibility
      when(ast.title, `accTitle: ${ast.title}`),
      when(ast.accDescription, `accDescr: ${ast.accDescription}`),

      // State definitions (with type annotations)
      ...stateEntries
        .filter(([, state]) => state.type !== 'default' || state.doc)
        .map(([, state]) => renderState(state, statesInTransitions)),

      // State descriptions (without composite states)
      ...stateEntries
        .filter(([, state]) => state.description && !state.doc && state.type === 'default')
        .map(([, state]) => renderState(state, statesInTransitions)),

      // Transitions
      ...ast.transitions.map(renderTransition),

      // Notes
      ...stateEntries.filter(([, state]) => state.note).map(([, state]) => renderNote(state)),

      // Class definitions
      renderClassDefs(ast.classDefs),

      // Style definitions
      renderStyles(ast.styles),

      // Class applications
      renderClassApplications(ast.classApplications),

      // Click handlers
      renderClicks(ast.clicks),
    ]),
  ];

  return render(doc, opts.indent);
}
