# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.2] - 2025-01-18

### Added
- **More idempotence tests** - Added tests for block (columns, nested, with-edges) and kanban (multiple-columns) diagrams

### Fixed
- **Block diagram edge rendering** - Fixed edges to render inline with nodes (`a["A"] --> b["B"]`) instead of separate lines (`a --> b`). The JISON parser only recognizes edges when inline with nodes, so the previous format broke idempotence.
- **Block renderer test expectations** - Updated tests to match the new idempotent edge rendering format

## [0.8.1] - 2025-01-18

### Added
- **Idempotence tests** - Added comprehensive idempotence test infrastructure with 95 flowchart fixtures from mermaid.js
  - Tests verify `render(parse(render(parse(x)))) === render(parse(x))`
  - Snapshot tests compare rendered output to expected files
  - Idempotence tests verify output stability through parse/render cycles

### Fixed
- **Arrow length preservation** - Fixed flowchart parser to preserve exact arrow lengths for idempotence
  - Arrows with endpoints (`-->`, `==>`): `length = dashCount - 1`
  - Open arrows (`---`, `===`): `length = dashCount - 2`
  - Previously, arrow lengths were normalized, breaking idempotence

### Changed
- **TEST_STANDARDS.md** - Added comprehensive documentation on idempotence testing requirements

## [0.8.0] - 2025-01-18

### Added
- **C4 diagram support** - Complete implementation with parser, renderer, wrapper class (`C4`), and 173 tests
  - All 5 diagram types: C4Context, C4Container, C4Component, C4Dynamic, C4Deployment
  - Elements: Person, System, Container, Component, DeploymentNode (with Ext/Db/Queue variants)
  - Boundaries: Boundary, Enterprise_Boundary, System_Boundary, Container_Boundary
  - Relationships: Rel, BiRel, Rel_U/D/L/R, RelIndex
  - Styling: UpdateElementStyle, UpdateRelStyle, UpdateLayoutConfig
  - Full fluent API with query operations

- **Pie chart support** - Complete implementation using `@mermaid-js/parser` (Langium), with 71 tests
  - Sections with labels and values
  - Title and showData options
  - Accessibility metadata (accTitle, accDescr)
  - Full fluent API

- **GitGraph diagram support** - Complete implementation using `@mermaid-js/parser` (Langium), with 98 tests
  - Statements: commit, branch, checkout, merge, cherry-pick
  - Commit attributes: id, message, tag, type (NORMAL/REVERSE/HIGHLIGHT)
  - Branch ordering
  - Merge and cherry-pick with tags
  - Direction support (LR, TB, BT)
  - Full fluent API

- **Langium parser integration** - Added `@mermaid-js/parser` as dependency for diagram types without JISON parsers

- **AST type discriminator documentation** - Documented that we use `type` field (not Langium's `$type`) for consistency

### Changed
- **All 18 diagram types now implemented** - Pie and GitGraph were the last remaining types

### Prompts Used

```
ok cool cool . is readme up to date?

ok cool. does ci pass. also is the $ast difference documented. or like visible in the types. are we even exposing the types of what ast we are giving out

hmmmm question. do you think its a good idea to have 'type' as a field name

what are other differences between our ast and langium

I think I care about is that if Mermaid moves to more Lanium parsers and they expose more ASC for other types of type camps, we are going to be like our ASC and it costs us nothing to change it right now because we have no users. I wonder what's going to happen in the future when if Mermaid migrates more stuff to Lanium, it would be nice to stay compatible. Suppose what do you think?

well the thing is that since we have no users i dont care amuch about what our 16 parsers arbitrarily chose to produce one day ago

in typescrijpt can one say foo.$type or do they have to say foo['$type']? or is foo.type also ok?

eh ok lets keep .type just document it in the readme

ok lets make a release?
```

## [0.7.0] - 2025-01-17

### Added
- **Kanban diagram support** - Complete implementation with parser, renderer (using doc.ts), wrapper class, and 71 tests
  - Hierarchical node structure with indent levels
  - Multiple node shapes (round, square, diamond, stadium, subroutine, asymmetric)
  - Node decorations (icons and CSS classes)
  - Shape data support
  - Full fluent API with query operations
- **XY Chart diagram support** - Complete implementation with parser, renderer (using doc.ts), wrapper class, and 98 tests
  - Line and bar series with labels
  - X-axis: categorical bands or numeric ranges
  - Y-axis: numeric ranges
  - Chart orientation (vertical/horizontal)
  - Accessibility metadata (accTitle, accDescription)
  - Full fluent API for building and querying charts
- **doc.ts rendering guideline** - Updated AGENTS.md to require all new renderers to use doc.ts library
- **Release checklist** - Added `.agents/release-checklist.md` with complete release process

### Fixed
- **Kanban renderer delimiters** - Fixed SUBROUTINE (`([])` → `([-])`) and ASYMMETRIC (`(--)` → `(-)-)`) shape delimiters
- **KanbanNodeType documentation** - Added comprehensive JSDoc documenting which shapes are parseable vs render-only (mermaid.js limitation)

### Prompts Used

```
review https://github.com/neongreen/mermaid-ast/pull/4. youll need to do jj git fetch, jj bookmark track ... , jj new ..., etc etc; any steps that arent documented in ~/.agents/jj.md must be documented. when reviewing pay attention to consistency, following existing repo standards, all tests lints etc must still pass, nothing must be stubbed or "fixed" by tactical hacks

yeah do it. and remove that section from agents md, it should just link to the table in the readme

and then please based on this pr write a checklist about how to add new diagram types; everything, everything that needs to be done, even small things must be documengted there

push as separate commit

check the suggestions in the pr

nah check `github-pr-comments`

and yeah explain why tests didnt catch this

and add to the checklist

but yeah please document sure

merged. whats your checklist for releasing the new version?

lets release as 0.7.0; also replace github release command with `just ast-release` and it will publish to both so no need for step 6. for step 1 use either just ast-bump-minor or just ast-bump-patch

wait for ci

also btw ci failed

add to the checklist also

actually move the checklist into /Users/emily/code/mermaid-ast/.agents/release-checklist.md and refer to it in agents md
```

## [0.6.2] - 2025-01-17

### Fixed
- **ast-bump-* commands** - Fixed justfile bump commands to use jq instead of npm version, which doesn't work with bun workspace dependencies
- **README in npm package** - Restored README.md to the published npm package

## [0.6.1] - 2025-01-17

### Fixed

- **Biome version mismatch** - Upgraded root biome from 1.9.4 to 2.3.11 to match package version. Biome 1.x and 2.x have different config syntax which caused CI failures.
- **CI/Publish test parity** - Both CI and publish workflows now run lint and tests from subdirectories, matching what `prepublishOnly` runs. This prevents publish failures that CI didn't catch.
- **bun.lock validation** - Added CI step to verify bun.lock is up to date before running tests.

### Changed

- **Disabled noisy lints** - Disabled `assist/source/organizeImports` and `correctness/noUnusedImports` for faster iteration.

## [0.6.0] - 2025-01-17

### Added

- **JSON golden tests for AST parsing** - New test infrastructure in `tests/golden/golden.test.ts` that validates complete AST structure using canonical JSON snapshots. Catches structural bugs that property-based tests might miss (e.g., storing strings as objects).
- **Detection functions for all diagram types** - Added `isErDiagram()`, `isGanttDiagram()`, `isJourneyDiagram()`, `isMindmapDiagram()`, and `isTimelineDiagram()` for consistent diagram type detection
- **Expanded parse() support** - Main `parse()` function now supports all 11 implemented diagram types (was 5, now includes er, gantt, journey, mindmap, timeline, state)
- **Justfile commands for golden tests** - Added `test-golden` to run JSON golden tests and `update-golden-json` to regenerate expected outputs
- **Sankey diagram support** - Full implementation with types, parser, renderer, wrapper class (`Sankey`), and comprehensive tests
- **Quadrant chart support** - Full implementation with types, parser, renderer, wrapper class (`Quadrant`), and comprehensive tests
- **Parser sync improvements** - Updated `sync-parsers` script to sync all available JISON parsers by default
- **Node.js compatibility** - Converted `sync-parsers` script from Bun-specific APIs to Node.js for broader compatibility
- **API consistency** - Added `sectionCount` getter to `Journey` and `Timeline` wrapper classes to match `Gantt`
- **Bun workspace structure** - Migrated to monorepo with `packages/mermaid-ast/` and `packages/mermaid-svg/`

### Changed

- **JISON parser collection** - Synced additional parsers from mermaid.js including: sankey, xychart, quadrant, requirement, c4, block, kanban
- **Biome configuration** - Disabled `lint/style/` rules for less noisy linting
- **Project structure** - Moved to `packages/` directory for workspace support

### Prompts Used

This update was implemented using GitHub Copilot Workspace agent and Slate with the following prompts:

1. **Initial request**: "add all missing diagram types, exactly following the test structure, existing conventions etc etc etc, there must be complete feature parity"

2. **Refinements**:
   - "oh and dont use jj this is only for my local dev. you can use git etc"
   - "you can use sync-parsers to add the missing ones and you can update the readme also"
   - "in fact sync-parsers should just get *all* parsers available in given mermaid version imo"
   - "you can remove the INITIAL_SUBSET thing and remove --all and just always make it be all"
   - "Note: Pie and Git Graph don't have JISON parsers in upstream mermaid either then theyre out of scope for you" - confirmed understood
   - "Given the time and token constraints, let me streamline the remaining implementations by creating skeletal test files first and then we can generate the golden files. Let me create tests for quadrant: <- you can stop at quadrant if you have constraints"
   - "better have fully consistent implementations than all but inconsistent"
   - "you can stop here really if youre fully consistent"
   - "like if youre completely done with some of the diagram types"
   - "then thats it"
   - "but only if FULLY done. tests, impl, readme, changelog"
   - "add my prompts from this session to the changelog! i want all agent changes to be accompanied with prompts so that ppl see how easy stuff is"

3. **Workspace migration** (Slate):
   - "ok and afterwards lets migrate to have /packages/mermaid-ast,mermaid-svg and a bun workspace ? is this ok? or do you have ideas"
   - "lets disable lint/style/ lints"

4. **Result**: Fully implemented 2 new diagram types (Sankey and Quadrant) with complete feature parity, all tests passing (1051 tests, 0 failures), comprehensive documentation, improved sync-parsers script, and migrated to bun workspace structure.

## [0.5.1] - 2025-01-17

### Fixed

- **JSR compatibility** - Removed module augmentation pattern that JSR doesn't allow
- **Biome lint warning** - Refactored flowchart graph ops to avoid unsafe declaration merging

### Changed

- **Flowchart graph operations** - Now use imported functions as class properties instead of prototype augmentation. This is a cleaner pattern that avoids both JSR compatibility issues and TypeScript lint warnings.

### Added

- **JSR dry-run in CI** - Added `npx jsr publish --dry-run` to CI workflow to catch JSR compatibility issues early

### Prompts Used

```
i mean i wanted to not have a giant file. but is there no other way to have separation?
lets do 1
ok cool now we release 0.5.1?
```

## [0.5.0] - 2026-01-17

### Added

- **DiagramWrapper Base Class** - Abstract base class for all diagram wrapper classes:
  - `toAST()` - Get the underlying AST
  - `clone()` - Deep clone the diagram
  - `render()` - Render to Mermaid syntax
  - Static factory methods: `create()`, `from()`, `parse()`

- **Flowchart Wrapper Class** - Unified API for building, mutating, and querying flowcharts:
  - `Flowchart.create()`, `.from()`, `.parse()` - Factory methods
  - `toAST()`, `render()`, `clone()` - Core methods
  - **Node operations**: `addNode`, `removeNode`, `getNode`, `setNodeText`, `setNodeShape`, `addClass`, `removeClass`, `findNodes`
  - **Link operations**: `addLink`, `removeLink`, `flipLink`, `setLinkType`, `setLinkStroke`, `setLinkText`, `getLinksFrom`, `getLinksTo`, `addLinksFromMany`, `addLinksToMany`
  - **Subgraph operations**: `createSubgraph`, `dissolveSubgraph`, `moveToSubgraph`, `extractFromSubgraph`, `mergeSubgraphs`
  - **Graph surgery**: `insertBetween`, `removeAndReconnect`, `getReachable`, `getAncestors`, `getPath`
  - **Chain operations (jj-style)**: `getChain`, `yankChain`, `spliceChain`, `reverseChain`, `extractChain`, `rebaseNodes`
  - 65 new tests

- **Sequence Wrapper Class** - `Sequence` wrapper extending DiagramWrapper:
  - Factory methods: `create()`, `from()`, `parse()`
  - Actor operations: `addActor`, `removeActor`, `getActor`, `hasActor`, `renameActor`
  - Message operations: `addMessage`, `getMessages`, `getMessagesBetween`
  - Control flow: `addLoop`, `addAlt`, `addOpt`, `addPar`, `addCritical`, `addBreak`, `addRect`
  - Note operations: `addNote`, `getNotes`
  - Activation operations: `addActivation`, `addDeactivation`
  - Query operations: `findActors`, `findMessages`
  - 32 new tests

- **ClassDiagram Wrapper Class** - `ClassDiagram` wrapper extending DiagramWrapper:
  - Factory methods: `create()`, `from()`, `parse()`
  - Class operations: `addClass`, `removeClass`, `renameClass`, `getClass`, `hasClass`, `setClassLabel`
  - Member operations: `addMember`, `addAttribute`, `addMethod`, `getMembers`, `removeMember`
  - Annotation operations: `addAnnotation`, `removeAnnotation`
  - Relation operations: `addRelation`, `addInheritance`, `addComposition`, `addAggregation`, `addDependency`, `addAssociation`, `getRelations`, `getRelationsFor`, `removeRelation`
  - Namespace operations: `addNamespace`, `addToNamespace`, `removeFromNamespace`, `getNamespaceFor`
  - Note operations: `addNote`, `getNotes`
  - Style operations: `defineStyle`, `applyStyle`
  - Query operations: `findClasses`, `getSubclasses`, `getParentClass`, `getAncestors`, `getDescendants`
  - 28 new tests

- **StateDiagram Wrapper Class** - `StateDiagram` wrapper extending DiagramWrapper:
  - Factory methods: `create()`, `from()`, `parse()`
  - State operations: `addState`, `removeState`, `renameState`, `getState`, `hasState`, `setStateDescription`
  - Special states: `addFork`, `addJoin`, `addChoice`
  - Transition operations: `addTransition`, `addInitial`, `addFinal`, `getTransitions`, `getTransitionsFrom`, `getTransitionsTo`, `removeTransition`, `setTransitionLabel`
  - Composite state operations: `addComposite`, `isComposite`, `getNestedStates`
  - Note operations: `addNote`, `getNote`
  - Style operations: `defineStyle`, `applyStyle`
  - Query operations: `findStates`, `getReachable`, `getAncestors`, `hasPath`, `getInitialStates`, `getFinalStates`
  - 36 new tests

- **ER Diagram Support** with `ErDiagram` wrapper class:
  - Types: entities, attributes (with types/keys), relationships, cardinality
  - Parser with custom yy object
  - Renderer with all relationship types and cardinality notations
  - Wrapper API: `addEntity`, `addAttribute`, `addRelationship`, `setCardinality`, `findEntities`, `getRelationshipsFor`
  - 26 new tests

- **Gantt Chart Support** with `Gantt` wrapper class:
  - Types: tasks, sections, milestones, date formats, excludes, includes, weekends
  - Parser with custom yy object supporting all Gantt features
  - Renderer with proper date formatting
  - Wrapper API: `addSection`, `addTask`, `addMilestone`, `setDateFormat`, `setExcludes`, `findTasks`, `getTasksInSection`, `getCriticalTasks`
  - 24 new tests

- **Mindmap Support** with `Mindmap` wrapper class:
  - Types: hierarchical nodes with shapes (square, rounded, circle, bang, cloud, hexagon), icons, CSS classes
  - Parser with custom yy object and level normalization
  - Renderer preserving hierarchy
  - Wrapper API: `addChild`, `removeNode`, `setDescription`, `setShape`, `setIcon`, `setClass`, `moveNode`, `getParent`, `getSiblings`, `getNodesAtLevel`, `getLeafNodes`, `getPath`
  - 24 new tests

- **Journey Diagram Support** with `Journey` wrapper class:
  - Types: sections, tasks with scores (1-5), actors
  - Parser with custom yy object
  - Renderer with proper formatting
  - Wrapper API: `addSection`, `addTask`, `setScore`, `addActor`, `removeActor`, `moveTask`, `getPainPoints`, `getHighlights`, `getAverageScore`, `getTasksForActor`
  - 27 new tests

- **Timeline Diagram Support** with `Timeline` wrapper class:
  - Types: sections, periods, events
  - Parser with custom yy object
  - Renderer with proper hierarchy
  - Wrapper API: `addSection`, `addPeriod`, `addEvent`, `addEventWithPeriod`, `updateEvent`, `findPeriods`, `findEvents`, `getEventsForPeriod`, `getSectionForPeriod`
  - 26 new tests

- **Parser tests for all diagram types**:
  - `journey-parser.test.ts` - Tests for journey diagram parsing (7 tests)
  - `mindmap-parser.test.ts` - Tests for mindmap diagram parsing (5 tests)
  - `timeline-parser.test.ts` - Tests for timeline diagram parsing (5 tests)

- **Test structure documentation** in AGENTS.md:
  - Standard test file naming conventions
  - Expected test categories for each diagram type
  - Test coverage status table
  - Release instructions

### Changed

- **Refactored Flowchart wrapper** to extend DiagramWrapper base class
- **Removed old flowchart() builder** - Use `Flowchart.create()` instead
- Updated README to document all wrapper classes and remove Fluent Builder API section
- **Test file reorganization** - Split wrapper tests from renderer tests for all diagram types
- **Consolidated ER renderer tests** - Merged duplicate test files
- **Standardized test naming** - Removed `-wrapper` suffix from test files

### Removed

- **Legacy Fluent Builder API** - Removed `sequence()`, `classDiagram()`, `stateDiagram()` builder functions
  - Migration: Use `Sequence.create()`, `ClassDiagram.create()`, `StateDiagram.create()` instead

### Fixed

- Lazy evaluation for `renderClassAssignments` in flowchart renderer
- **RenderOptions type consistency** - All diagram renderers now use `indent: number | 'tab'`
- **Sequence filterStatements type error** - Fixed TypeScript error for alt/par sections
- **Biome formatting** - Fixed trailing newline issues in test files

### Prompts Used

```
i want ast manipulations and i want like Imagine what I'm building is an interactive diagram editor...

ok perfect, anything you'd want to change or fix or improve before we do more diagrams?

ok lets do 1, 2a, 3 lets create wrappers as well but think about how to avoid huge amounts of boilerplate?

lets add some diagram types to this plan as well

perfect now what is left to do? biome, changelog, ......, ?

oh please split it as well. with amp. make a full todo list for whats needed for the release

document the expected test structure etc in AGENTS.md and then do all of the above

also i dont think we need the -wrapper name? like the wrappers are our main way to use the library

Also try using AMP for some of these tasks, but also always make a commit before and always review the changes after
```

## [0.4.0] - 2025-01-17

### Added

- **Fluent Builder API** - Chainable, type-safe builders for all diagram types:
  - `flowchart()` - Build flowcharts with nodes, links, subgraphs, classDef, styles
  - `sequence()` - Build sequence diagrams with participants, actors, messages, loops, alt, notes
  - `classDiagram()` - Build class diagrams with classes, members, relations, namespaces
  - `stateDiagram()` - Build state diagrams with states, transitions, composites, fork/join/choice

- **Builder validation** - `.build()` validates by default (e.g., errors if link references non-existent node)
  - Can be disabled with `.build({ validate: false })`

- **JSR.io publishing support** - Added `jsr.json` for publishing as `@emily/mermaid-ast`
  - `just jsr-publish` - Publish to JSR
  - `just publish-all` - Publish to both npm and JSR

- **Biome linting** - Added Biome for code quality
  - `useDefaultSwitchClause` rule enabled
  - `assertNever()` helper for exhaustive type checking

- **README improvements**
  - Diagram type checklist showing implemented vs not-implemented
  - Builder API examples for all 4 diagram types

### Changed

- State diagram builder no longer auto-creates states in transitions (allows validation to catch missing states)

### Prompts Used

```
ok just in case for default/case/switch could you have used assertNever() or smth at least in some cases?
yes lets go. make a plan
we support more than just flowchart and sequence tho?
1 - what do you suggest? 2 - nah
ok. create todos and start
also in the readme lets have a checkboxes list with diagram types that are and arent implemented
also do you link to my github repo in the package json?
also i want to publish to jsr.io
for jsr it'll be @emily/mermaid-ast i think because scopes
also if you can create smaller test files like idk break them into several please do
i dont want 500+ loc test files
ok so which version should it be
yes
```

## [0.3.0] - 2025-01-17

### Added

- **State Diagram tests** - 36 comprehensive unit tests for state diagram parsing and rendering
- **Render options round-trip tests** - 187 tests verifying that all render options produce valid, re-parseable output
- **Doc builder improvements**
  - `blank` constant for empty lines in rendered output
  - Lazy `when()` evaluation (accepts function for deferred computation)
  - `block()` options with `indent: false` for non-indented blocks
  - `join()` helper for joining documents with separators
- **Mermaid.js attribution** - Added THIRD-PARTY-NOTICES.md for proper attribution of vendored parsers

### Changed

- **BREAKING: `indent` option changed from string to number**
  - Old: `{ indent: "  " }` (string)
  - New: `{ indent: 2 }` (number of spaces)
  - Use `{ indent: "tab" }` for tab indentation
  - This is a cleaner API that's easier to use

### Documentation

- Documented that **comments are not preserved** during parsing (Mermaid `%%` comments are discarded by JISON parsers)
- Updated README with new `indent` option format

### Prompts Used

```
add state diagram tests
ok so lets agree on the plan. give me numbered list of todos and ill say which ones you should do autonomously and then ping me
ok this looks perfect you should do all ten
and then make a sound
btw does mermaid have comments? if yes, do we preserve them?
we should document that we dont preserve them
also i think we have to attribute mermaid js where we use their tests / code / etc. idk how its done with MIT
also im not they im she
also i wonder if we have to duplicate yy stuff for each diagram type? later you can review if theres something we have to do here as we add more diagram types
yes please add such tests (render options roundtrip)
its ok if tests run even 10x as long
or 20x as long
its completely ok correctness is much more important
also do we have tests that check svg roundtrip?
also btw i suppose we could very easily build a mermaid formatter in the same repo
well for indent we should just take number of spaces, no? why " "? and yeah should have it as cli tool and should also decide what kind of good cli interface it should have
separate package; option a
when 0.3.0?
lets go B
```

## [0.2.0] - 2025-01-17

### Added

- **Class Diagram support** - Full parsing and rendering of class diagrams
  - Classes with labels and members (attributes and methods)
  - Visibility modifiers: `+` (public), `-` (private), `#` (protected), `~` (package)
  - Relationships: inheritance (`<|--`), composition (`*--`), aggregation (`o--`), dependency (`<--`), lollipop (`()--`)
  - Line types: solid (`--`), dotted (`..`)
  - Cardinality labels on relationships
  - Annotations: `<<interface>>`, `<<abstract>>`, `<<service>>`, etc.
  - Namespaces for grouping classes
  - Notes: `note for Class "text"`
  - Direction: `direction LR`, `direction TB`, etc.
  - Styling: `cssClass`, `classDef`
  - Interactions: `callback`, `link`
  - Generic types: `class List~T~`

- **Test Infrastructure (v0.2.0)**
  - Extracted test fixtures from mermaid.js for flowchart, sequence, class, and state diagrams
  - Added 164 fixture-based round-trip tests
  - Added `examples/` directory with runnable TypeScript examples matching README
  - Added CI step to verify documentation examples compile and run
  - Tests now included in TypeScript typechecking (catches type errors in tests)

### Fixed

- Sequence diagram activation normalization (`-` shortcut now correctly sets `deactivate: true`)
- cssClass multi-id parsing (`cssClass "C1,C2" style` now applies to both classes)
- Click callback rendering (removed incorrect "call" keyword)
- Exported `parseClassDiagram`, `renderClassDiagram`, `isClassDiagram` from main index

### Prompts Used

**Class Diagram Implementation:**
```
add ci
perfect. add more diagram types. one per commit. make a plan first
looks good. make a todo list
oh and in the changelog i want each entry to include all prompts i used for that version
Oh also can you do very good documentation and usage examples and stuff? And is there actually a way to test or check examples in documentation as well? How does documentation stuff work in JavaScript land
first diagram types
eh ok lets go with (1) for now but we'll talk about this later
ok and dont forget to update changelog, make atomic commits, and include prompts
```

**Test Infrastructure (this session):**
```
ok lets go lets go
and make a sound after each step and i want you to commit often
oh and make the repo public before releasing 0.2.0
is this smth typescript couldve caught?
add typescript settings that would forbid `let foo;`
also does `bun typecheck` check tests as well?
later lets also add linting with biome and see what it gives us. and also lets see if we can configure smth to forbid `switch` without a default case
does ci also run roundtrip?
Oh, we are absolutely not ready until all tests pass.
ok do 1 and 2
```

## [0.1.1] - 2025-01-17

### Fixed

- Fixed npm package missing vendored parsers - build now copies `src/vendored/` to `dist/vendored/`

### Issue Report

> The vendored parsers are missing from the package. This seems like the package wasn't published correctly - it's missing the dist/vendored directory. The package was just published and it seems like the vendored parsers weren't included in the dist folder. This is a packaging issue - the dist/vendored/ directory is missing from the published npm package.

### Prompts Used

```
how can you make sure that this is now ok?
did you update the changelog
but include an abridged msg i included with the error
```

## [0.1.0] - 2025-01-17

### Added

- Initial release
- **Flowchart diagram support**
  - Parse and render flowchart/graph diagrams
  - All directions: LR, RL, TB, TD, BT
  - All node shapes: square, round, stadium, subroutine, cylinder, circle, asymmetric, diamond, hexagon, parallelogram, trapezoid, double-circle, etc.
  - All link types: arrow, open, cross, circle with normal/thick/dotted strokes
  - Link labels
  - Subgraphs with titles and directions
  - Styling: `classDef`, `class`, `style`, `linkStyle`
  - Click handlers (callbacks and URLs)
- **Sequence diagram support**
  - Parse and render sequence diagrams
  - Participants and actors with aliases
  - All message types: solid/dashed lines, arrows/open ends, async
  - Activations: `activate`/`deactivate`
  - Control flow: `loop`, `alt`/`else`, `opt`, `par`, `critical`, `break`
  - Grouping: `rect` backgrounds
  - Notes: `note left of`, `note right of`, `note over`
  - Actor lifecycle: `create`, `destroy`
  - Autonumbering
  - Links
- **Core features**
  - `parse(text)` - Parse any supported diagram to AST
  - `render(ast)` - Render any AST back to Mermaid syntax
  - `detectDiagramType(text)` - Detect diagram type from text
  - Round-trip guarantee: `render(parse(text))` produces semantically equivalent diagrams
- **TypeScript support**
  - Full type definitions for all AST structures
  - Exported types: `FlowchartAST`, `SequenceAST`, `MermaidAST`, etc.
- **Cross-runtime support**
  - Works in Bun, Node.js, and Deno
  - Dagger pipeline for cross-runtime testing
- **Developer tooling**
  - Parser sync script to update vendored JISON parsers from mermaid.js
  - Comprehensive test suite (129 tests)
  - Mermaid.js SVG compatibility tests

### Technical Details

- Uses vendored JISON parsers from mermaid.js v11.4.2
- No regex-based parsing - all parsing uses grammar-based JISON parsers