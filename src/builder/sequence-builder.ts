/**
 * Sequence Diagram Builder
 *
 * Fluent API for constructing Sequence Diagram ASTs programmatically.
 */

import {
  createEmptySequenceAST,
  type NotePlacement,
  type SequenceActivation,
  type SequenceAlt,
  type SequenceArrowType,
  type SequenceAST,
  type SequenceAutonumber,
  type SequenceBox,
  type SequenceBreak,
  type SequenceCritical,
  type SequenceDetails,
  type SequenceLink,
  type SequenceLinks,
  type SequenceLoop,
  type SequenceMessage,
  type SequenceNote,
  type SequenceOpt,
  type SequencePar,
  type SequenceProperties,
  type SequenceRect,
  type SequenceStatement,
} from '../types/sequence.js';

/**
 * Options for adding a participant
 */
export interface ParticipantOptions {
  alias?: string;
  created?: boolean;
}

/**
 * Options for adding a message
 */
export interface MessageOptions {
  arrow?: SequenceArrowType;
  activate?: boolean;
  deactivate?: boolean;
}

/**
 * Options for adding a note
 */
export interface NoteOptions {
  placement?: NotePlacement;
}

/**
 * Options for build()
 */
export interface SequenceBuildOptions {
  validate?: boolean;
}

/**
 * Validation error for invalid AST
 */
export class SequenceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SequenceValidationError';
  }
}

/**
 * Base class for statement builders (used in nested contexts)
 */
class StatementBuilder {
  protected statements: SequenceStatement[] = [];
  protected parentBuilder: SequenceBuilder;

  constructor(parentBuilder: SequenceBuilder) {
    this.parentBuilder = parentBuilder;
  }

  /**
   * Add a message between actors
   */
  message(from: string, to: string, text: string, options?: MessageOptions): this {
    const msg: SequenceMessage = {
      type: 'message',
      from,
      to,
      text,
      arrowType: options?.arrow ?? 'solid',
    };
    if (options?.activate) msg.activate = true;
    if (options?.deactivate) msg.deactivate = true;

    // Ensure actors exist in parent
    this.parentBuilder.ensureActor(from);
    this.parentBuilder.ensureActor(to);

    this.statements.push(msg);
    return this;
  }

  /**
   * Add a note
   */
  note(actors: string | string[], text: string, options?: NoteOptions): this {
    const actorList = Array.isArray(actors) ? actors : [actors];
    const note: SequenceNote = {
      type: 'note',
      placement: options?.placement ?? 'right_of',
      actors: actorList,
      text,
    };
    this.statements.push(note);
    return this;
  }

  /**
   * Activate an actor
   */
  activate(actor: string): this {
    const activation: SequenceActivation = {
      type: 'activate',
      actor,
    };
    this.statements.push(activation);
    return this;
  }

  /**
   * Deactivate an actor
   */
  deactivate(actor: string): this {
    const deactivation: SequenceActivation = {
      type: 'deactivate',
      actor,
    };
    this.statements.push(deactivation);
    return this;
  }

  /**
   * Add a loop block
   */
  loop(text: string, builderFn: (builder: StatementBuilder) => void): this {
    const loopBuilder = new StatementBuilder(this.parentBuilder);
    builderFn(loopBuilder);

    const loop: SequenceLoop = {
      type: 'loop',
      text,
      statements: loopBuilder.getStatements(),
    };
    this.statements.push(loop);
    return this;
  }

  /**
   * Add an alt block with sections
   */
  alt(sections: Array<{ condition: string; build: (builder: StatementBuilder) => void }>): this {
    const altSections = sections.map((section) => {
      const sectionBuilder = new StatementBuilder(this.parentBuilder);
      section.build(sectionBuilder);
      return {
        condition: section.condition,
        statements: sectionBuilder.getStatements(),
      };
    });

    const alt: SequenceAlt = {
      type: 'alt',
      sections: altSections,
    };
    this.statements.push(alt);
    return this;
  }

  /**
   * Add an opt block
   */
  opt(text: string, builderFn: (builder: StatementBuilder) => void): this {
    const optBuilder = new StatementBuilder(this.parentBuilder);
    builderFn(optBuilder);

    const opt: SequenceOpt = {
      type: 'opt',
      text,
      statements: optBuilder.getStatements(),
    };
    this.statements.push(opt);
    return this;
  }

  /**
   * Add a par block with sections
   */
  par(sections: Array<{ text: string; build: (builder: StatementBuilder) => void }>): this {
    const parSections = sections.map((section) => {
      const sectionBuilder = new StatementBuilder(this.parentBuilder);
      section.build(sectionBuilder);
      return {
        text: section.text,
        statements: sectionBuilder.getStatements(),
      };
    });

    const par: SequencePar = {
      type: 'par',
      sections: parSections,
    };
    this.statements.push(par);
    return this;
  }

  /**
   * Add a critical block
   */
  critical(
    text: string,
    builderFn: (builder: StatementBuilder) => void,
    options?: Array<{ text: string; build: (builder: StatementBuilder) => void }>
  ): this {
    const criticalBuilder = new StatementBuilder(this.parentBuilder);
    builderFn(criticalBuilder);

    const criticalOptions = (options ?? []).map((opt) => {
      const optBuilder = new StatementBuilder(this.parentBuilder);
      opt.build(optBuilder);
      return {
        text: opt.text,
        statements: optBuilder.getStatements(),
      };
    });

    const critical: SequenceCritical = {
      type: 'critical',
      text,
      statements: criticalBuilder.getStatements(),
      options: criticalOptions,
    };
    this.statements.push(critical);
    return this;
  }

  /**
   * Add a break block
   */
  break(text: string, builderFn: (builder: StatementBuilder) => void): this {
    const breakBuilder = new StatementBuilder(this.parentBuilder);
    builderFn(breakBuilder);

    const brk: SequenceBreak = {
      type: 'break',
      text,
      statements: breakBuilder.getStatements(),
    };
    this.statements.push(brk);
    return this;
  }

  /**
   * Add a rect (highlight) block
   */
  rect(color: string, builderFn: (builder: StatementBuilder) => void): this {
    const rectBuilder = new StatementBuilder(this.parentBuilder);
    builderFn(rectBuilder);

    const rect: SequenceRect = {
      type: 'rect',
      color,
      statements: rectBuilder.getStatements(),
    };
    this.statements.push(rect);
    return this;
  }

  /**
   * Get the statements built so far
   */
  getStatements(): SequenceStatement[] {
    return this.statements;
  }
}

/**
 * Fluent builder for Sequence Diagram ASTs
 */
export class SequenceBuilder extends StatementBuilder {
  private ast: SequenceAST;
  private currentBox: SequenceBox | null = null;

  constructor() {
    // @ts-expect-error - We'll set parentBuilder to this after super()
    super(null);
    this.ast = createEmptySequenceAST();
    // Set parentBuilder to this for the base StatementBuilder methods
    this.parentBuilder = this;
  }

  /**
   * Add a participant
   */
  participant(id: string, name?: string, options?: ParticipantOptions): this {
    this.ast.actors.set(id, {
      id,
      name: name ?? id,
      alias: options?.alias,
      type: 'participant',
      created: options?.created,
    });

    if (this.currentBox) {
      this.currentBox.actors.push(id);
    }

    return this;
  }

  /**
   * Add an actor (stick figure)
   */
  actor(id: string, name?: string, options?: ParticipantOptions): this {
    this.ast.actors.set(id, {
      id,
      name: name ?? id,
      alias: options?.alias,
      type: 'actor',
      created: options?.created,
    });

    if (this.currentBox) {
      this.currentBox.actors.push(id);
    }

    return this;
  }

  /**
   * Ensure an actor exists (for messages referencing actors not explicitly declared)
   */
  ensureActor(id: string): void {
    if (!this.ast.actors.has(id)) {
      this.ast.actors.set(id, {
        id,
        name: id,
        type: 'participant',
      });
    }
  }

  /**
   * Add a box grouping for actors
   */
  box(
    text: string | undefined,
    builderFn: (builder: SequenceBuilder) => void,
    color?: string
  ): this {
    this.currentBox = {
      type: 'box',
      text,
      color,
      actors: [],
    };

    builderFn(this);

    this.ast.boxes.push(this.currentBox);
    this.currentBox = null;

    return this;
  }

  /**
   * Enable autonumbering
   */
  autonumber(start?: number, step?: number): this {
    const autonumber: SequenceAutonumber = {
      type: 'autonumber',
      start,
      step,
      visible: true,
    };
    this.statements.push(autonumber);
    return this;
  }

  /**
   * Disable autonumbering
   */
  autonumberOff(): this {
    const autonumber: SequenceAutonumber = {
      type: 'autonumber',
      visible: false,
    };
    this.statements.push(autonumber);
    return this;
  }

  /**
   * Add a link to an actor
   */
  link(actor: string, text: string, url: string): this {
    const link: SequenceLink = {
      type: 'link',
      actor,
      text,
      url,
    };
    this.statements.push(link);
    return this;
  }

  /**
   * Add multiple links to an actor
   */
  links(actor: string, links: Record<string, string>): this {
    const linksStmt: SequenceLinks = {
      type: 'links',
      actor,
      links,
    };
    this.statements.push(linksStmt);
    return this;
  }

  /**
   * Add properties to an actor
   */
  properties(actor: string, properties: Record<string, string>): this {
    const props: SequenceProperties = {
      type: 'properties',
      actor,
      properties,
    };
    this.statements.push(props);
    return this;
  }

  /**
   * Add details to an actor
   */
  details(actor: string, details: string): this {
    const det: SequenceDetails = {
      type: 'details',
      actor,
      details,
    };
    this.statements.push(det);
    return this;
  }

  /**
   * Set the diagram title
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

    // Check that all message actors exist
    const checkStatements = (stmts: SequenceStatement[]) => {
      for (const stmt of stmts) {
        if (stmt.type === 'message') {
          if (!this.ast.actors.has(stmt.from)) {
            errors.push(`Message from non-existent actor '${stmt.from}'`);
          }
          if (!this.ast.actors.has(stmt.to)) {
            errors.push(`Message to non-existent actor '${stmt.to}'`);
          }
        } else if (stmt.type === 'note') {
          for (const actor of stmt.actors) {
            if (!this.ast.actors.has(actor)) {
              errors.push(`Note on non-existent actor '${actor}'`);
            }
          }
        } else if (stmt.type === 'activate' || stmt.type === 'deactivate') {
          if (!this.ast.actors.has(stmt.actor)) {
            errors.push(`Activation on non-existent actor '${stmt.actor}'`);
          }
        } else if (stmt.type === 'loop' || stmt.type === 'opt' || stmt.type === 'break') {
          checkStatements(stmt.statements);
        } else if (stmt.type === 'alt' || stmt.type === 'par') {
          for (const section of stmt.sections) {
            checkStatements(section.statements);
          }
        } else if (stmt.type === 'critical') {
          checkStatements(stmt.statements);
          for (const option of stmt.options) {
            checkStatements(option.statements);
          }
        } else if (stmt.type === 'rect') {
          checkStatements(stmt.statements);
        }
      }
    };

    checkStatements(this.statements);

    // Check box actors exist
    for (const box of this.ast.boxes) {
      for (const actorId of box.actors) {
        if (!this.ast.actors.has(actorId)) {
          errors.push(`Box contains non-existent actor '${actorId}'`);
        }
      }
    }

    if (errors.length > 0) {
      throw new SequenceValidationError(errors.join('\n'));
    }
  }

  /**
   * Build and return the SequenceAST
   */
  build(options?: SequenceBuildOptions): SequenceAST {
    // Copy statements to AST
    this.ast.statements = this.statements;

    const shouldValidate = options?.validate !== false;

    if (shouldValidate) {
      this.validate();
    }

    return this.ast;
  }
}

/**
 * Create a new SequenceBuilder
 */
export function sequence(): SequenceBuilder {
  return new SequenceBuilder();
}
