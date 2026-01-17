/**
 * State Diagram Builder
 *
 * Fluent API for constructing State Diagram ASTs programmatically.
 */

import {
  createEmptyStateDiagramAST,
  type StateApplyClass,
  type StateClassDef,
  type StateClick,
  type StateDefinition,
  type StateDiagramAST,
  type StateDirection,
  type StateNote,
  type StateStatement,
  type StateStyleDef,
  type StateTransition,
  type StateType,
} from '../types/state.js';

/**
 * Options for adding a state
 */
export interface StateOptions {
  type?: StateType;
  description?: string | string[];
  classes?: string[];
}

/**
 * Options for adding a transition
 */
export interface TransitionOptions {
  label?: string;
}

/**
 * Options for build()
 */
export interface StateBuildOptions {
  validate?: boolean;
}

/**
 * Validation error for invalid AST
 */
export class StateDiagramValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StateDiagramValidationError';
  }
}

/**
 * Special state IDs
 */
const START_STATE = '[*]';
const END_STATE = '[*]';

/**
 * Builder for composite states (used in nested contexts)
 */
export class CompositeStateBuilder {
  private statements: StateStatement[] = [];
  private parentBuilder: StateDiagramBuilder;

  constructor(parentBuilder: StateDiagramBuilder) {
    this.parentBuilder = parentBuilder;
  }

  /**
   * Add a state
   */
  state(id: string, options?: StateOptions): this {
    const stateDef: StateDefinition = {
      id,
      type: options?.type ?? 'default',
      description: options?.description,
      classes: options?.classes,
    };

    this.parentBuilder.registerState(stateDef);
    this.statements.push({ stmt: 'state', state: stateDef });
    return this;
  }

  /**
   * Add a transition
   */
  transition(from: string, to: string, options?: TransitionOptions): this {
    // Ensure states exist
    this.parentBuilder.ensureState(from);
    this.parentBuilder.ensureState(to);

    const transition: StateTransition = {
      state1: this.parentBuilder.getStateRef(from),
      state2: this.parentBuilder.getStateRef(to),
      description: options?.label,
    };

    this.parentBuilder.addTransition(transition);
    this.statements.push({ stmt: 'relation', transition });
    return this;
  }

  /**
   * Add a direction statement
   */
  direction(dir: StateDirection): this {
    this.statements.push({ stmt: 'dir', value: dir });
    return this;
  }

  /**
   * Get the statements
   */
  getStatements(): StateStatement[] {
    return this.statements;
  }
}

/**
 * Fluent builder for State Diagram ASTs
 */
export class StateDiagramBuilder {
  private ast: StateDiagramAST;

  constructor(direction: StateDirection = 'TB') {
    this.ast = createEmptyStateDiagramAST();
    this.ast.direction = direction;
  }

  /**
   * Set the direction
   */
  direction(direction: StateDirection): this {
    this.ast.direction = direction;
    return this;
  }

  /**
   * Register a state in the AST
   */
  registerState(stateDef: StateDefinition): void {
    this.ast.states.set(stateDef.id, stateDef);
  }

  /**
   * Ensure a state exists (creates it if not)
   */
  ensureState(id: string): void {
    if (id === START_STATE || id === END_STATE) {
      return; // Special states don't need to be registered
    }
    if (!this.ast.states.has(id)) {
      const stateDef: StateDefinition = {
        id,
        type: 'default',
      };
      this.ast.states.set(id, stateDef);
    }
  }

  /**
   * Get a state reference (for transitions)
   */
  getStateRef(id: string): StateDefinition {
    if (id === START_STATE || id === END_STATE) {
      return { id, type: 'default' };
    }
    return this.ast.states.get(id) ?? { id, type: 'default' };
  }

  /**
   * Add a transition to the AST
   */
  addTransition(transition: StateTransition): void {
    this.ast.transitions.push(transition);
  }

  /**
   * Add a state
   */
  state(id: string, options?: StateOptions): this {
    const stateDef: StateDefinition = {
      id,
      type: options?.type ?? 'default',
      description: options?.description,
      classes: options?.classes,
    };

    this.ast.states.set(id, stateDef);
    return this;
  }

  /**
   * Add a fork state
   */
  fork(id: string): this {
    return this.state(id, { type: 'fork' });
  }

  /**
   * Add a join state
   */
  join(id: string): this {
    return this.state(id, { type: 'join' });
  }

  /**
   * Add a choice state
   */
  choice(id: string): this {
    return this.state(id, { type: 'choice' });
  }

  /**
   * Add a transition between states
   */
  transition(from: string, to: string, options?: TransitionOptions): this {
    const transition: StateTransition = {
      state1: this.getStateRef(from),
      state2: this.getStateRef(to),
      description: options?.label,
    };

    this.ast.transitions.push(transition);
    return this;
  }

  /**
   * Add a transition from the start state
   */
  initial(to: string, options?: TransitionOptions): this {
    return this.transition(START_STATE, to, options);
  }

  /**
   * Add a transition to the end state
   */
  final(from: string, options?: TransitionOptions): this {
    return this.transition(from, END_STATE, options);
  }

  /**
   * Add a composite state with nested states
   */
  composite(
    id: string,
    builderFn: (builder: CompositeStateBuilder) => void,
    options?: StateOptions
  ): this {
    const compositeBuilder = new CompositeStateBuilder(this);
    builderFn(compositeBuilder);

    const stateDef: StateDefinition = {
      id,
      type: options?.type ?? 'default',
      description: options?.description,
      classes: options?.classes,
      doc: compositeBuilder.getStatements(),
    };

    this.ast.states.set(id, stateDef);
    return this;
  }

  /**
   * Add a note to a state
   */
  note(stateId: string, text: string, position: 'left of' | 'right of' = 'right of'): this {
    const state = this.ast.states.get(stateId);
    if (state) {
      const note: StateNote = {
        position,
        text,
      };
      state.note = note;
    }
    return this;
  }

  /**
   * Define a CSS class
   */
  classDef(name: string, styles: string): this {
    const classDef: StateClassDef = {
      id: name,
      classes: styles,
    };
    this.ast.classDefs.set(name, classDef);
    return this;
  }

  /**
   * Apply a class to state(s)
   */
  applyClass(stateIds: string | string[], className: string): this {
    const ids = Array.isArray(stateIds) ? stateIds.join(',') : stateIds;
    const applyClass: StateApplyClass = {
      id: ids,
      styleClass: className,
    };
    this.ast.classApplications.push(applyClass);
    return this;
  }

  /**
   * Add inline styles to state(s)
   */
  style(stateIds: string | string[], styles: string): this {
    const ids = Array.isArray(stateIds) ? stateIds.join(',') : stateIds;
    const styleDef: StateStyleDef = {
      id: ids,
      styleClass: styles,
    };
    this.ast.styles.push(styleDef);
    return this;
  }

  /**
   * Add a click handler
   */
  click(stateId: string, url?: string, tooltip?: string): this {
    const click: StateClick = {
      id: stateId,
      url,
      tooltip,
    };
    this.ast.clicks.push(click);
    return this;
  }

  /**
   * Set the accessibility title
   */
  title(title: string): this {
    this.ast.title = title;
    return this;
  }

  /**
   * Set the accessibility description
   */
  accDescription(description: string): this {
    this.ast.accDescription = description;
    return this;
  }

  /**
   * Validate the AST
   */
  private validate(): void {
    const errors: string[] = [];

    // Check that all transition states exist (except [*])
    for (const transition of this.ast.transitions) {
      const from = transition.state1.id;
      const to = transition.state2.id;

      if (from !== START_STATE && from !== END_STATE && !this.ast.states.has(from)) {
        errors.push(`Transition from non-existent state '${from}'`);
      }
      if (to !== START_STATE && to !== END_STATE && !this.ast.states.has(to)) {
        errors.push(`Transition to non-existent state '${to}'`);
      }
    }

    // Check that all click handlers reference existing states
    for (const click of this.ast.clicks) {
      if (!this.ast.states.has(click.id)) {
        errors.push(`Click handler on non-existent state '${click.id}'`);
      }
    }

    if (errors.length > 0) {
      throw new StateDiagramValidationError(errors.join('\n'));
    }
  }

  /**
   * Build and return the StateDiagramAST
   */
  build(options?: StateBuildOptions): StateDiagramAST {
    const shouldValidate = options?.validate !== false;

    if (shouldValidate) {
      this.validate();
    }

    return this.ast;
  }
}

/**
 * Create a new StateDiagramBuilder
 */
export function stateDiagram(direction: StateDirection = 'TB'): StateDiagramBuilder {
  return new StateDiagramBuilder(direction);
}
