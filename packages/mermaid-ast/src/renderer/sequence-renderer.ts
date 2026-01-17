/**
 * Sequence Diagram Renderer
 *
 * Renders a Sequence Diagram AST back to Mermaid syntax.
 */

import type { RenderOptions } from '../types/render-options.js';
import { resolveOptions } from '../types/render-options.js';
import type {
  SequenceActivation,
  SequenceActor,
  SequenceAlt,
  SequenceArrowType,
  SequenceAST,
  SequenceAutonumber,
  SequenceBox,
  SequenceBreak,
  SequenceCritical,
  SequenceDetails,
  SequenceLink,
  SequenceLinks,
  SequenceLoop,
  SequenceMessage,
  SequenceNote,
  SequenceOpt,
  SequencePar,
  SequenceProperties,
  SequenceRect,
  SequenceStatement,
} from '../types/sequence.js';
import { assertNever } from '../utils.js';
import { block, type Doc, indent, render } from './doc.js';

/**
 * Convert arrow type to Mermaid syntax
 */
function renderArrow(arrowType: SequenceArrowType): string {
  switch (arrowType) {
    case 'solid':
      return '->>';
    case 'dotted':
      return '-->>';
    case 'solid_open':
      return '->';
    case 'dotted_open':
      return '-->';
    case 'solid_cross':
      return '-x';
    case 'dotted_cross':
      return '--x';
    case 'solid_point':
      return '-)';
    case 'dotted_point':
      return '--)';
    case 'bidirectional_solid':
      return '<<->>';
    case 'bidirectional_dotted':
      return '<<-->>';
    default:
      return assertNever(arrowType, `Unknown arrow type: ${arrowType}`);
  }
}

/**
 * Render a single statement to Doc
 */
function renderStatement(stmt: SequenceStatement): Doc {
  switch (stmt.type) {
    case 'message': {
      const msg = stmt as SequenceMessage;
      let arrow = renderArrow(msg.arrowType);
      if (msg.activate) {
        arrow = `${arrow}+`;
      }
      if (msg.deactivate) {
        arrow = `${arrow}-`;
      }
      let line = `${msg.from}${arrow}${msg.to}`;
      if (msg.text) {
        line += `: ${msg.text}`;
      }
      return line;
    }

    case 'note': {
      const note = stmt as SequenceNote;
      const placement = note.placement.replace('_', ' ');
      const actors = note.actors.join(',');
      return `note ${placement} ${actors}: ${note.text}`;
    }

    case 'activate': {
      const activation = stmt as SequenceActivation;
      return `activate ${activation.actor}`;
    }

    case 'deactivate': {
      const deactivation = stmt as SequenceActivation;
      return `deactivate ${deactivation.actor}`;
    }

    case 'loop': {
      const loop = stmt as SequenceLoop;
      return block(`loop ${loop.text}`, loop.statements.map(renderStatement), 'end');
    }

    case 'alt': {
      const alt = stmt as SequenceAlt;
      const content: Doc[] = [];
      for (let i = 0; i < alt.sections.length; i++) {
        const section = alt.sections[i];
        if (i === 0) {
          content.push(`alt ${section.condition}`);
        } else {
          content.push(`else ${section.condition}`);
        }
        content.push(indent(section.statements.map(renderStatement)));
      }
      content.push('end');
      return content;
    }

    case 'opt': {
      const opt = stmt as SequenceOpt;
      return block(`opt ${opt.text}`, opt.statements.map(renderStatement), 'end');
    }

    case 'par': {
      const par = stmt as SequencePar;
      const content: Doc[] = [];
      for (let i = 0; i < par.sections.length; i++) {
        const section = par.sections[i];
        if (i === 0) {
          content.push(`par ${section.text}`);
        } else {
          content.push(`and ${section.text}`);
        }
        content.push(indent(section.statements.map(renderStatement)));
      }
      content.push('end');
      return content;
    }

    case 'critical': {
      const critical = stmt as SequenceCritical;
      const content: Doc[] = [];
      content.push(`critical ${critical.text}`);
      content.push(indent(critical.statements.map(renderStatement)));
      for (const option of critical.options) {
        content.push(`option ${option.text}`);
        content.push(indent(option.statements.map(renderStatement)));
      }
      content.push('end');
      return content;
    }

    case 'break': {
      const brk = stmt as SequenceBreak;
      return block(`break ${brk.text}`, brk.statements.map(renderStatement), 'end');
    }

    case 'rect': {
      const rect = stmt as SequenceRect;
      return block(`rect ${rect.color}`, rect.statements.map(renderStatement), 'end');
    }

    case 'autonumber': {
      const auto = stmt as SequenceAutonumber;
      if (!auto.visible) {
        return 'autonumber off';
      }
      if (auto.start !== undefined && auto.step !== undefined) {
        return `autonumber ${auto.start} ${auto.step}`;
      }
      if (auto.start !== undefined) {
        return `autonumber ${auto.start}`;
      }
      return 'autonumber';
    }

    case 'link': {
      const link = stmt as SequenceLink;
      return `link ${link.actor}: ${link.text} @ ${link.url}`;
    }

    case 'links': {
      const links = stmt as SequenceLinks;
      const linksJson = JSON.stringify(links.links);
      return `links ${links.actor}: ${linksJson}`;
    }

    case 'properties': {
      const props = stmt as SequenceProperties;
      const propsJson = JSON.stringify(props.properties);
      return `properties ${props.actor}: ${propsJson}`;
    }

    case 'details': {
      const details = stmt as SequenceDetails;
      return `details ${details.actor}: ${details.details}`;
    }

    default:
      return assertNever(stmt, `Unknown statement type: ${(stmt as { type: string }).type}`);
  }
}

/**
 * Render actor declaration to string
 */
function renderActor(actor: SequenceActor): string {
  const keyword = actor.type === 'actor' ? 'actor' : 'participant';
  const created = actor.created ? 'create ' : '';

  if (actor.alias && actor.alias !== actor.id) {
    return `${created}${keyword} ${actor.id} as ${actor.name}`;
  }

  if (actor.name !== actor.id) {
    return `${created}${keyword} ${actor.id} as ${actor.name}`;
  }

  return `${created}${keyword} ${actor.id}`;
}

/**
 * Render a box with its actors to Doc
 */
function renderBox(box: SequenceBox, ast: SequenceAST): Doc {
  let boxLine = 'box';
  if (box.color) {
    boxLine += ` ${box.color}`;
  }
  if (box.text) {
    boxLine += ` ${box.text}`;
  }

  const actorDocs: Doc[] = [];
  for (const actorId of box.actors) {
    const actor = ast.actors.get(actorId);
    if (actor) {
      actorDocs.push(renderActor(actor));
    }
  }

  return block(boxLine, actorDocs, 'end');
}

/**
 * Filter statements to skip redundant activate/deactivate
 *
 * When a message has activate/deactivate flags (from shortcut syntax like ->>+ or -->>-),
 * the parser also creates separate activate/deactivate statements. We need to skip these
 * redundant statements to avoid duplication when re-parsing.
 */
function filterRedundantStatements(statements: SequenceStatement[]): SequenceStatement[] {
  const result: SequenceStatement[] = [];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const prevStmt = i > 0 ? statements[i - 1] : null;

    // Skip activate statement if previous message already has activate flag for same actor
    if (stmt.type === 'activate' && prevStmt?.type === 'message') {
      const msg = prevStmt as SequenceMessage;
      const activation = stmt as SequenceActivation;
      if (msg.activate && msg.to === activation.actor) {
        continue;
      }
    }

    // Skip deactivate statement if previous message already has deactivate flag for same actor
    if (stmt.type === 'deactivate' && prevStmt?.type === 'message') {
      const msg = prevStmt as SequenceMessage;
      const deactivation = stmt as SequenceActivation;
      if (msg.deactivate && msg.from === deactivation.actor) {
        continue;
      }
    }

    result.push(stmt);
  }

  return result;
}

/**
 * Render a SequenceAST to Mermaid syntax
 */
export function renderSequence(ast: SequenceAST, options?: RenderOptions): string {
  const opts = resolveOptions(options);

  // Track which actors have been rendered (in boxes)
  const renderedActors = new Set<string>();

  // Get actors (optionally sorted)
  const actorEntries = [...ast.actors.entries()];
  if (opts.sortNodes) {
    actorEntries.sort((a, b) => a[0].localeCompare(b[0]));
  }

  // Filter redundant statements
  const filteredStatements = filterRedundantStatements(ast.statements);

  // Build the document
  const doc: Doc = [
    'sequenceDiagram',
    indent([
      // Boxes (with their actors)
      ...ast.boxes.map((box) => {
        for (const actorId of box.actors) {
          renderedActors.add(actorId);
        }
        return renderBox(box, ast);
      }),

      // Remaining actors (not in boxes, not created dynamically)
      ...actorEntries
        .filter(([actorId, actor]) => !renderedActors.has(actorId) && !actor.created)
        .map(([, actor]) => renderActor(actor)),

      // Statements
      ...filteredStatements.map(renderStatement),
    ]),
  ];

  return render(doc, opts.indent);
}
