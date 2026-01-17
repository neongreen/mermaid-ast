/**
 * Sequence Diagram Wrapper Class
 *
 * A unified API for building, mutating, and querying sequence diagrams.
 * Provides a fluent interface that wraps the SequenceAST.
 */

import { DiagramWrapper } from './diagram-wrapper.js';
import { parseSequence } from './parser/sequence-parser.js';
import { renderSequence } from './renderer/sequence-renderer.js';
import type { RenderOptions } from './types/render-options.js';
import type {
  NotePlacement,
  SequenceActivation,
  SequenceAlt,
  SequenceArrowType,
  SequenceAST,
  SequenceAutonumber,
  SequenceBox,
  SequenceBreak,
  SequenceCritical,
  SequenceLoop,
  SequenceMessage,
  SequenceNote,
  SequenceOpt,
  SequencePar,
  SequenceRect,
  SequenceStatement,
} from './types/sequence.js';
import { createEmptySequenceAST } from './types/sequence.js';

/** Options for adding an actor/participant */
export interface AddActorOptions {
  alias?: string;
  type?: 'participant' | 'actor';
}

/** Options for adding a message */
export interface AddMessageOptions {
  arrow?: SequenceArrowType;
  activate?: boolean;
  deactivate?: boolean;
}

/** Options for adding a note */
export interface AddNoteOptions {
  placement?: NotePlacement;
}

/**
 * A fluent wrapper for SequenceAST that supports building, mutating, and querying.
 */
export class Sequence extends DiagramWrapper<SequenceAST> {
  private constructor(ast: SequenceAST) {
    super(ast);
  }

  // ============ Factory Methods ============

  /** Create a new empty sequence diagram */
  static create(title?: string): Sequence {
    const ast = createEmptySequenceAST();
    if (title) ast.title = title;
    return new Sequence(ast);
  }

  /** Create from an existing AST */
  static from(ast: SequenceAST): Sequence {
    return new Sequence(structuredClone(ast));
  }

  /** Parse Mermaid syntax into a Sequence */
  static parse(input: string): Sequence {
    return new Sequence(parseSequence(input));
  }

  // ============ Core Methods ============

  render(options?: RenderOptions): string {
    return renderSequence(this.ast, options);
  }

  clone(): Sequence {
    return new Sequence(structuredClone(this.ast));
  }

  // ============ Properties ============

  get title(): string | undefined {
    return this.ast.title;
  }

  get actorCount(): number {
    return this.ast.actors.size;
  }

  get statementCount(): number {
    return this.ast.statements.length;
  }

  get actors(): Map<string, { id: string; name: string; type: 'participant' | 'actor' }> {
    return new Map(
      Array.from(this.ast.actors.entries()).map(([id, actor]) => [
        id,
        { id: actor.id, name: actor.name, type: actor.type },
      ])
    );
  }

  // ============ Title Operations ============

  setTitle(title: string): this {
    this.ast.title = title;
    return this;
  }

  // ============ Actor Operations ============

  /** Add a participant */
  addParticipant(id: string, name?: string, options?: AddActorOptions): this {
    this.ast.actors.set(id, {
      id,
      name: name ?? id,
      alias: options?.alias,
      type: 'participant',
    });
    return this;
  }

  /** Add an actor (stick figure) */
  addActor(id: string, name?: string, options?: AddActorOptions): this {
    this.ast.actors.set(id, {
      id,
      name: name ?? id,
      alias: options?.alias,
      type: 'actor',
    });
    return this;
  }

  /** Remove an actor and optionally their messages */
  removeActor(id: string, options?: { removeMessages?: boolean }): this {
    this.ast.actors.delete(id);
    if (options?.removeMessages) {
      this.ast.statements = this.filterStatements(this.ast.statements, (stmt) => {
        if (stmt.type === 'message') {
          return stmt.from !== id && stmt.to !== id;
        }
        if (stmt.type === 'note') {
          return !stmt.actors.includes(id);
        }
        if (stmt.type === 'activate' || stmt.type === 'deactivate') {
          return stmt.actor !== id;
        }
        return true;
      });
    }
    return this;
  }

  /** Rename an actor */
  renameActor(id: string, newName: string): this {
    const actor = this.ast.actors.get(id);
    if (actor) {
      actor.name = newName;
    }
    return this;
  }

  /** Get an actor by ID */
  getActor(id: string): { id: string; name: string; type: 'participant' | 'actor' } | undefined {
    const actor = this.ast.actors.get(id);
    if (!actor) return undefined;
    return { id: actor.id, name: actor.name, type: actor.type };
  }

  /** Check if actor exists */
  hasActor(id: string): boolean {
    return this.ast.actors.has(id);
  }

  // ============ Message Operations ============

  /** Add a message between actors */
  addMessage(from: string, to: string, text: string, options?: AddMessageOptions): this {
    // Auto-create actors if they don't exist
    if (!this.ast.actors.has(from)) {
      this.addParticipant(from);
    }
    if (!this.ast.actors.has(to)) {
      this.addParticipant(to);
    }

    const msg: SequenceMessage = {
      type: 'message',
      from,
      to,
      text,
      arrowType: options?.arrow ?? 'solid',
    };
    if (options?.activate) msg.activate = true;
    if (options?.deactivate) msg.deactivate = true;

    this.ast.statements.push(msg);
    return this;
  }

  /** Get all messages */
  getMessages(): SequenceMessage[] {
    return this.ast.statements.filter((s): s is SequenceMessage => s.type === 'message');
  }

  /** Get messages from a specific actor */
  getMessagesFrom(actorId: string): SequenceMessage[] {
    return this.getMessages().filter((m) => m.from === actorId);
  }

  /** Get messages to a specific actor */
  getMessagesTo(actorId: string): SequenceMessage[] {
    return this.getMessages().filter((m) => m.to === actorId);
  }

  /** Get messages between two actors */
  getMessagesBetween(actor1: string, actor2: string): SequenceMessage[] {
    return this.getMessages().filter(
      (m) => (m.from === actor1 && m.to === actor2) || (m.from === actor2 && m.to === actor1)
    );
  }

  // ============ Note Operations ============

  /** Add a note */
  addNote(actors: string | string[], text: string, options?: AddNoteOptions): this {
    const actorList = Array.isArray(actors) ? actors : [actors];
    const note: SequenceNote = {
      type: 'note',
      placement: options?.placement ?? 'right_of',
      actors: actorList,
      text,
    };
    this.ast.statements.push(note);
    return this;
  }

  /** Get all notes */
  getNotes(): SequenceNote[] {
    return this.ast.statements.filter((s): s is SequenceNote => s.type === 'note');
  }

  // ============ Activation Operations ============

  /** Activate an actor */
  activate(actor: string): this {
    const activation: SequenceActivation = {
      type: 'activate',
      actor,
    };
    this.ast.statements.push(activation);
    return this;
  }

  /** Deactivate an actor */
  deactivate(actor: string): this {
    const deactivation: SequenceActivation = {
      type: 'deactivate',
      actor,
    };
    this.ast.statements.push(deactivation);
    return this;
  }

  // ============ Control Flow Operations ============

  /** Add a loop block */
  addLoop(text: string, buildFn: (seq: Sequence) => void): this {
    const innerSeq = Sequence.create();
    buildFn(innerSeq);
    const loop: SequenceLoop = {
      type: 'loop',
      text,
      statements: innerSeq.ast.statements,
    };
    this.ast.statements.push(loop);
    // Copy any actors created in the inner sequence
    for (const [id, actor] of innerSeq.ast.actors) {
      if (!this.ast.actors.has(id)) {
        this.ast.actors.set(id, actor);
      }
    }
    return this;
  }

  /** Add an alt block with sections */
  addAlt(sections: Array<{ condition: string; build: (seq: Sequence) => void }>): this {
    const altSections = sections.map((section) => {
      const innerSeq = Sequence.create();
      section.build(innerSeq);
      // Copy actors
      for (const [id, actor] of innerSeq.ast.actors) {
        if (!this.ast.actors.has(id)) {
          this.ast.actors.set(id, actor);
        }
      }
      return {
        condition: section.condition,
        statements: innerSeq.ast.statements,
      };
    });
    const alt: SequenceAlt = {
      type: 'alt',
      sections: altSections,
    };
    this.ast.statements.push(alt);
    return this;
  }

  /** Add an opt block */
  addOpt(text: string, buildFn: (seq: Sequence) => void): this {
    const innerSeq = Sequence.create();
    buildFn(innerSeq);
    const opt: SequenceOpt = {
      type: 'opt',
      text,
      statements: innerSeq.ast.statements,
    };
    this.ast.statements.push(opt);
    for (const [id, actor] of innerSeq.ast.actors) {
      if (!this.ast.actors.has(id)) {
        this.ast.actors.set(id, actor);
      }
    }
    return this;
  }

  /** Add a par block with sections */
  addPar(sections: Array<{ text: string; build: (seq: Sequence) => void }>): this {
    const parSections = sections.map((section) => {
      const innerSeq = Sequence.create();
      section.build(innerSeq);
      for (const [id, actor] of innerSeq.ast.actors) {
        if (!this.ast.actors.has(id)) {
          this.ast.actors.set(id, actor);
        }
      }
      return {
        text: section.text,
        statements: innerSeq.ast.statements,
      };
    });
    const par: SequencePar = {
      type: 'par',
      sections: parSections,
    };
    this.ast.statements.push(par);
    return this;
  }

  /** Add a critical block */
  addCritical(
    text: string,
    buildFn: (seq: Sequence) => void,
    options?: Array<{ text: string; build: (seq: Sequence) => void }>
  ): this {
    const innerSeq = Sequence.create();
    buildFn(innerSeq);
    for (const [id, actor] of innerSeq.ast.actors) {
      if (!this.ast.actors.has(id)) {
        this.ast.actors.set(id, actor);
      }
    }

    const criticalOptions = (options ?? []).map((opt) => {
      const optSeq = Sequence.create();
      opt.build(optSeq);
      for (const [id, actor] of optSeq.ast.actors) {
        if (!this.ast.actors.has(id)) {
          this.ast.actors.set(id, actor);
        }
      }
      return {
        text: opt.text,
        statements: optSeq.ast.statements,
      };
    });

    const critical: SequenceCritical = {
      type: 'critical',
      text,
      statements: innerSeq.ast.statements,
      options: criticalOptions,
    };
    this.ast.statements.push(critical);
    return this;
  }

  /** Add a break block */
  addBreak(text: string, buildFn: (seq: Sequence) => void): this {
    const innerSeq = Sequence.create();
    buildFn(innerSeq);
    const brk: SequenceBreak = {
      type: 'break',
      text,
      statements: innerSeq.ast.statements,
    };
    this.ast.statements.push(brk);
    for (const [id, actor] of innerSeq.ast.actors) {
      if (!this.ast.actors.has(id)) {
        this.ast.actors.set(id, actor);
      }
    }
    return this;
  }

  /** Add a rect (highlight) block */
  addRect(color: string, buildFn: (seq: Sequence) => void): this {
    const innerSeq = Sequence.create();
    buildFn(innerSeq);
    const rect: SequenceRect = {
      type: 'rect',
      color,
      statements: innerSeq.ast.statements,
    };
    this.ast.statements.push(rect);
    for (const [id, actor] of innerSeq.ast.actors) {
      if (!this.ast.actors.has(id)) {
        this.ast.actors.set(id, actor);
      }
    }
    return this;
  }

  // ============ Box Operations ============

  /** Add a box grouping for actors */
  addBox(text: string | undefined, actorIds: string[], color?: string): this {
    const box: SequenceBox = {
      type: 'box',
      text,
      color,
      actors: actorIds,
    };
    this.ast.boxes.push(box);
    return this;
  }

  /** Get all boxes */
  getBoxes(): SequenceBox[] {
    return this.ast.boxes;
  }

  // ============ Autonumber Operations ============

  /** Enable autonumbering */
  autonumber(start?: number, step?: number): this {
    const autonumber: SequenceAutonumber = {
      type: 'autonumber',
      start,
      step,
      visible: true,
    };
    this.ast.statements.push(autonumber);
    return this;
  }

  /** Disable autonumbering */
  autonumberOff(): this {
    const autonumber: SequenceAutonumber = {
      type: 'autonumber',
      visible: false,
    };
    this.ast.statements.push(autonumber);
    return this;
  }

  // ============ Query Operations ============

  /** Find actors by type */
  findActors(query: {
    type?: 'participant' | 'actor';
  }): Array<{ id: string; name: string; type: 'participant' | 'actor' }> {
    const results: Array<{ id: string; name: string; type: 'participant' | 'actor' }> = [];
    for (const actor of this.ast.actors.values()) {
      if (query.type && actor.type !== query.type) continue;
      results.push({ id: actor.id, name: actor.name, type: actor.type });
    }
    return results;
  }

  /** Find messages by criteria */
  findMessages(query: {
    from?: string;
    to?: string;
    textContains?: string;
    arrow?: SequenceArrowType;
  }): SequenceMessage[] {
    return this.getMessages().filter((msg) => {
      if (query.from && msg.from !== query.from) return false;
      if (query.to && msg.to !== query.to) return false;
      if (query.textContains && !msg.text.includes(query.textContains)) return false;
      if (query.arrow && msg.arrowType !== query.arrow) return false;
      return true;
    });
  }

  /** Get all actors that communicate with a given actor */
  getCommunicatingActors(actorId: string): string[] {
    const actors = new Set<string>();
    for (const msg of this.getMessages()) {
      if (msg.from === actorId) actors.add(msg.to);
      if (msg.to === actorId) actors.add(msg.from);
    }
    return Array.from(actors);
  }

  // ============ Helper Methods ============

  /** Recursively filter statements */
  private filterStatements(
    statements: SequenceStatement[],
    predicate: (stmt: SequenceStatement) => boolean
  ): SequenceStatement[] {
    return statements.filter(predicate).map((stmt) => {
      if (stmt.type === 'loop' || stmt.type === 'opt' || stmt.type === 'break') {
        return { ...stmt, statements: this.filterStatements(stmt.statements, predicate) };
      }
      if (stmt.type === 'alt') {
        return {
          ...stmt,
          sections: stmt.sections.map((s) => ({
            condition: s.condition,
            statements: this.filterStatements(s.statements, predicate),
          })),
        };
      }
      if (stmt.type === 'par') {
        return {
          ...stmt,
          sections: stmt.sections.map((s) => ({
            text: s.text,
            statements: this.filterStatements(s.statements, predicate),
          })),
        };
      }
      if (stmt.type === 'critical') {
        return {
          ...stmt,
          statements: this.filterStatements(stmt.statements, predicate),
          options: stmt.options.map((o) => ({
            ...o,
            statements: this.filterStatements(o.statements, predicate),
          })),
        };
      }
      if (stmt.type === 'rect') {
        return { ...stmt, statements: this.filterStatements(stmt.statements, predicate) };
      }
      return stmt;
    });
  }
}
