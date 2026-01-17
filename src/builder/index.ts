/**
 * Fluent Builder API
 *
 * Provides chainable builders for constructing diagram ASTs programmatically.
 */

export {
  type ClassBuildOptions,
  ClassDiagramBuilder,
  ClassDiagramValidationError,
  type ClassOptions,
  classDiagram,
  type RelationOptions,
} from './class-builder.js';
export {
  type BuildOptions,
  FlowchartBuilder,
  FlowchartValidationError,
  flowchart,
  type LinkOptions,
  type NodeOptions,
  SubgraphBuilder,
} from './flowchart-builder.js';
export {
  type MessageOptions,
  type NoteOptions,
  type ParticipantOptions,
  SequenceBuilder,
  type SequenceBuildOptions,
  SequenceValidationError,
  sequence,
} from './sequence-builder.js';

export {
  type StateBuildOptions,
  StateDiagramBuilder,
  StateDiagramValidationError,
  type StateOptions,
  stateDiagram,
  type TransitionOptions,
} from './state-builder.js';
