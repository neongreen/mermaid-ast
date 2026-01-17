/**
 * State Diagram Wrapper Class
 *
 * A unified API for building, mutating, and querying state diagrams.
 * Provides a fluent interface that wraps the StateDiagramAST.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseStateDiagram } from './parser/state-parser.js';
import { renderStateDiagram } from './renderer/state-renderer.js';
import type { RenderOptions } from './types/render-options.js';
import type {
  StateDefinition,
  StateDiagramAST,
  StateDirection,
  StateNote,
  StateStatement,
  StateTransition,
  StateType,
} from './types/state.js';
import { createEmptyStateDiagramAST } from './types/state.js';

/** Options for adding a state */
export interface AddStateOptions {
  description?: string;
  type?: StateType;
}

/** Options for adding a transition */
export interface AddTransitionOptions {
  label?: string;
}

/** Special state IDs */
const START_STATE = '[*]';
const END_STATE = '[*]';

/**
 * A fluent wrapper for StateDiagramAST that supports building, mutating, and querying.
 */
export class StateDiagram extends DiagramWrapper<StateDiagramAST> {
  private constructor(ast: StateDiagramAST) {
    super(ast);
  }

  // ============ Factory Methods ============

  /** Create a new empty state diagram */
  static create(direction?: StateDirection): StateDiagram {
    const ast = createEmptyStateDiagramAST();
    if (direction) ast.direction = direction;
    return new StateDiagram(ast);
  }

  /** Create from an existing AST */
  static from(ast: StateDiagramAST): StateDiagram {
    return new StateDiagram(structuredClone(ast));
  }

  /** Parse Mermaid syntax into a StateDiagram */
  static parse(input: string): StateDiagram {
    return new StateDiagram(parseStateDiagram(input));
  }

  // ============ Core Methods ============

  render(options?: RenderOptions): string {
    return renderStateDiagram(this.ast, options);
  }

  clone(): StateDiagram {
    return new StateDiagram(structuredClone(this.ast));
  }

  // ============ Properties ============

  get direction(): StateDirection {
    return this.ast.direction;
  }

  get stateCount(): number {
    return this.ast.states.size;
  }

  get transitionCount(): number {
    return this.ast.transitions.length;
  }

  get states(): Map<string, { id: string; type: StateType; description?: string }> {
    return new Map(
      Array.from(this.ast.states.entries()).map(([id, state]) => [
        id,
        {
          id: state.id,
          type: state.type,
          description: Array.isArray(state.description)
            ? state.description.join('\n')
            : state.description,
        },
      ])
    );
  }

  // ============ Direction Operations ============

  setDirection(direction: StateDirection): this {
    this.ast.direction = direction;
    return this;
  }

  // ============ State Operations ============

  /** Add a state */
  addState(id: string, options?: AddStateOptions): this {
    const state: StateDefinition = {
      id,
      type: options?.type ?? 'default',
      description: options?.description,
    };
    this.ast.states.set(id, state);
    return this;
  }

  /** Remove a state and optionally its transitions */
  removeState(id: string, options?: { removeTransitions?: boolean }): this {
    this.ast.states.delete(id);
    if (options?.removeTransitions) {
      this.ast.transitions = this.ast.transitions.filter(
        (t) => t.state1.id !== id && t.state2.id !== id
      );
    }
    return this;
  }

  /** Rename a state */
  renameState(id: string, newId: string): this {
    const state = this.ast.states.get(id);
    if (state) {
      state.id = newId;
      this.ast.states.delete(id);
      this.ast.states.set(newId, state);
      // Update transitions
      for (const trans of this.ast.transitions) {
        if (trans.state1.id === id) trans.state1.id = newId;
        if (trans.state2.id === id) trans.state2.id = newId;
      }
    }
    return this;
  }

  /** Get a state by ID */
  getState(id: string): StateDefinition | undefined {
    return this.ast.states.get(id);
  }

  /** Check if state exists */
  hasState(id: string): boolean {
    return this.ast.states.has(id);
  }

  /** Set state description */
  setStateDescription(id: string, description: string): this {
    const state = this.ast.states.get(id);
    if (state) state.description = description;
    return this;
  }

  /** Add a fork state */
  addFork(id: string): this {
    return this.addState(id, { type: 'fork' });
  }

  /** Add a join state */
  addJoin(id: string): this {
    return this.addState(id, { type: 'join' });
  }

  /** Add a choice state */
  addChoice(id: string): this {
    return this.addState(id, { type: 'choice' });
  }

  // ============ Transition Operations ============

  /** Add a transition between states */
  addTransition(from: string, to: string, options?: AddTransitionOptions): this {
    // Auto-create states if they don't exist (except for [*])
    if (from !== START_STATE && !this.ast.states.has(from)) {
      this.addState(from);
    }
    if (to !== END_STATE && !this.ast.states.has(to)) {
      this.addState(to);
    }

    const fromState = this.ast.states.get(from) ?? { id: from, type: 'default' as StateType };
    const toState = this.ast.states.get(to) ?? { id: to, type: 'default' as StateType };

    const transition: StateTransition = {
      state1: fromState,
      state2: toState,
      description: options?.label,
    };
    this.ast.transitions.push(transition);
    return this;
  }

  /** Add initial transition (from start state) */
  addInitial(stateId: string): this {
    return this.addTransition(START_STATE, stateId);
  }

  /** Add final transition (to end state) */
  addFinal(stateId: string): this {
    return this.addTransition(stateId, END_STATE);
  }

  /** Get all transitions */
  getTransitions(): Array<{ from: string; to: string; label?: string }> {
    return this.ast.transitions.map((t) => ({
      from: t.state1.id,
      to: t.state2.id,
      label: t.description,
    }));
  }

  /** Get transitions from a state */
  getTransitionsFrom(stateId: string): Array<{ to: string; label?: string }> {
    return this.ast.transitions
      .filter((t) => t.state1.id === stateId)
      .map((t) => ({ to: t.state2.id, label: t.description }));
  }

  /** Get transitions to a state */
  getTransitionsTo(stateId: string): Array<{ from: string; label?: string }> {
    return this.ast.transitions
      .filter((t) => t.state2.id === stateId)
      .map((t) => ({ from: t.state1.id, label: t.description }));
  }

  /** Remove a transition */
  removeTransition(from: string, to: string): this {
    this.ast.transitions = this.ast.transitions.filter(
      (t) => !(t.state1.id === from && t.state2.id === to)
    );
    return this;
  }

  /** Set transition label */
  setTransitionLabel(from: string, to: string, label: string): this {
    const trans = this.ast.transitions.find((t) => t.state1.id === from && t.state2.id === to);
    if (trans) trans.description = label;
    return this;
  }

  // ============ Composite State Operations ============

  /** Add a composite (nested) state */
  addComposite(id: string, buildFn: (diagram: StateDiagram) => void): this {
    const innerDiagram = StateDiagram.create();
    buildFn(innerDiagram);

    // Convert inner states to statements
    const doc: StateStatement[] = [];
    for (const state of innerDiagram.ast.states.values()) {
      doc.push({ stmt: 'state', state });
    }
    for (const trans of innerDiagram.ast.transitions) {
      doc.push({ stmt: 'relation', transition: trans });
    }

    const state: StateDefinition = {
      id,
      type: 'default',
      doc,
    };
    this.ast.states.set(id, state);

    // Also add inner states to the main states map with prefixed IDs
    for (const innerState of innerDiagram.ast.states.values()) {
      if (!this.ast.states.has(innerState.id)) {
        this.ast.states.set(innerState.id, innerState);
      }
    }

    return this;
  }

  /** Check if state is composite */
  isComposite(stateId: string): boolean {
    const state = this.ast.states.get(stateId);
    return state?.doc !== undefined && state.doc.length > 0;
  }

  /** Get nested states of a composite state */
  getNestedStates(stateId: string): string[] {
    const state = this.ast.states.get(stateId);
    if (!state?.doc) return [];
    return state.doc
      .filter((stmt): stmt is { stmt: 'state'; state: StateDefinition } => stmt.stmt === 'state')
      .map((stmt) => stmt.state.id);
  }

  // ============ Note Operations ============

  /** Add a note to a state */
  addNote(stateId: string, text: string, position: 'left of' | 'right of' = 'right of'): this {
    const state = this.ast.states.get(stateId);
    if (state) {
      state.note = { position, text };
    }
    return this;
  }

  /** Get note for a state */
  getNote(stateId: string): StateNote | undefined {
    return this.ast.states.get(stateId)?.note;
  }

  // ============ Style Operations ============

  /** Define a class style */
  defineStyle(name: string, styles: string): this {
    this.ast.classDefs.set(name, { id: name, classes: styles });
    return this;
  }

  /** Apply style to a state */
  applyStyle(stateId: string, styleName: string): this {
    this.ast.classApplications.push({ id: stateId, styleClass: styleName });
    const state = this.ast.states.get(stateId);
    if (state) {
      if (!state.classes) state.classes = [];
      if (!state.classes.includes(styleName)) {
        state.classes.push(styleName);
      }
    }
    return this;
  }

  // ============ Query Operations ============

  /** Find states by type */
  findStates(query: { type?: StateType; hasNote?: boolean }): StateDefinition[] {
    const results: StateDefinition[] = [];
    for (const state of this.ast.states.values()) {
      if (query.type && state.type !== query.type) continue;
      if (query.hasNote !== undefined) {
        const hasNote = state.note !== undefined;
        if (query.hasNote !== hasNote) continue;
      }
      results.push(state);
    }
    return results;
  }

  /** Get all reachable states from a given state */
  getReachable(stateId: string): string[] {
    const visited = new Set<string>();
    const queue = [stateId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      for (const trans of this.ast.transitions) {
        if (trans.state1.id === current && !visited.has(trans.state2.id)) {
          queue.push(trans.state2.id);
        }
      }
    }

    visited.delete(stateId);
    return Array.from(visited);
  }

  /** Get all states that can reach a given state */
  getAncestors(stateId: string): string[] {
    const visited = new Set<string>();
    const queue = [stateId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      for (const trans of this.ast.transitions) {
        if (trans.state2.id === current && !visited.has(trans.state1.id)) {
          queue.push(trans.state1.id);
        }
      }
    }

    visited.delete(stateId);
    return Array.from(visited);
  }

  /** Check if there's a path between two states */
  hasPath(from: string, to: string): boolean {
    return this.getReachable(from).includes(to);
  }

  /** Get initial states (states with incoming transitions from [*]) */
  getInitialStates(): string[] {
    return this.ast.transitions.filter((t) => t.state1.id === START_STATE).map((t) => t.state2.id);
  }

  /** Get final states (states with outgoing transitions to [*]) */
  getFinalStates(): string[] {
    return this.ast.transitions.filter((t) => t.state2.id === END_STATE).map((t) => t.state1.id);
  }
}
