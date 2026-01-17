# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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