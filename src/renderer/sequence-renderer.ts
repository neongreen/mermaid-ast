/**
 * Sequence Diagram Renderer
 * 
 * Renders a Sequence Diagram AST back to Mermaid syntax.
 */

import type {
  SequenceAST,
  SequenceActor,
  SequenceMessage,
  SequenceNote,
  SequenceActivation,
  SequenceLoop,
  SequenceAlt,
  SequenceOpt,
  SequencePar,
  SequenceCritical,
  SequenceBreak,
  SequenceRect,
  SequenceBox,
  SequenceAutonumber,
  SequenceArrowType,
  SequenceStatement,
} from "../types/sequence.js";

/**
 * Convert arrow type to Mermaid syntax
 */
function renderArrow(arrowType: SequenceArrowType): string {
  switch (arrowType) {
    case "solid":
      return "->>";
    case "dotted":
      return "-->>";
    case "solid_open":
      return "->";
    case "dotted_open":
      return "-->";
    case "solid_cross":
      return "-x";
    case "dotted_cross":
      return "--x";
    case "solid_point":
      return "-)";
    case "dotted_point":
      return "--)";
    case "bidirectional_solid":
      return "<<->>";
    case "bidirectional_dotted":
      return "<<-->>";
    default:
      return "->>";
  }
}

/**
 * Escape text for Mermaid
 */
function escapeText(text: string): string {
  // Escape special characters
  return text.replace(/"/g, '\\"');
}

/**
 * Render a single statement with proper indentation
 */
function renderStatement(stmt: SequenceStatement, indent: string): string[] {
  const lines: string[] = [];

  switch (stmt.type) {
    case "message": {
      const msg = stmt as SequenceMessage;
      const arrow = renderArrow(msg.arrowType);
      let line = `${indent}${msg.from}${arrow}${msg.to}`;
      if (msg.text) {
        line += `: ${msg.text}`;
      }
      if (msg.activate) {
        line = line.replace(arrow, `${arrow}+`);
      }
      if (msg.deactivate) {
        line = line.replace(arrow, `${arrow}-`);
      }
      lines.push(line);
      break;
    }

    case "note": {
      const note = stmt as SequenceNote;
      const placement = note.placement.replace("_", " ");
      const actors = note.actors.join(",");
      lines.push(`${indent}note ${placement} ${actors}: ${note.text}`);
      break;
    }

    case "activate": {
      const activation = stmt as SequenceActivation;
      lines.push(`${indent}activate ${activation.actor}`);
      break;
    }

    case "deactivate": {
      const deactivation = stmt as SequenceActivation;
      lines.push(`${indent}deactivate ${deactivation.actor}`);
      break;
    }

    case "loop": {
      const loop = stmt as SequenceLoop;
      lines.push(`${indent}loop ${loop.text}`);
      for (const s of loop.statements) {
        lines.push(...renderStatement(s, indent + "    "));
      }
      lines.push(`${indent}end`);
      break;
    }

    case "alt": {
      const alt = stmt as SequenceAlt;
      for (let i = 0; i < alt.sections.length; i++) {
        const section = alt.sections[i];
        if (i === 0) {
          lines.push(`${indent}alt ${section.condition}`);
        } else {
          lines.push(`${indent}else ${section.condition}`);
        }
        for (const s of section.statements) {
          lines.push(...renderStatement(s, indent + "    "));
        }
      }
      lines.push(`${indent}end`);
      break;
    }

    case "opt": {
      const opt = stmt as SequenceOpt;
      lines.push(`${indent}opt ${opt.text}`);
      for (const s of opt.statements) {
        lines.push(...renderStatement(s, indent + "    "));
      }
      lines.push(`${indent}end`);
      break;
    }

    case "par": {
      const par = stmt as SequencePar;
      for (let i = 0; i < par.sections.length; i++) {
        const section = par.sections[i];
        if (i === 0) {
          lines.push(`${indent}par ${section.text}`);
        } else {
          lines.push(`${indent}and ${section.text}`);
        }
        for (const s of section.statements) {
          lines.push(...renderStatement(s, indent + "    "));
        }
      }
      lines.push(`${indent}end`);
      break;
    }

    case "critical": {
      const critical = stmt as SequenceCritical;
      lines.push(`${indent}critical ${critical.text}`);
      for (const s of critical.statements) {
        lines.push(...renderStatement(s, indent + "    "));
      }
      for (const option of critical.options) {
        lines.push(`${indent}option ${option.text}`);
        for (const s of option.statements) {
          lines.push(...renderStatement(s, indent + "    "));
        }
      }
      lines.push(`${indent}end`);
      break;
    }

    case "break": {
      const brk = stmt as SequenceBreak;
      lines.push(`${indent}break ${brk.text}`);
      for (const s of brk.statements) {
        lines.push(...renderStatement(s, indent + "    "));
      }
      lines.push(`${indent}end`);
      break;
    }

    case "rect": {
      const rect = stmt as SequenceRect;
      lines.push(`${indent}rect ${rect.color}`);
      for (const s of rect.statements) {
        lines.push(...renderStatement(s, indent + "    "));
      }
      lines.push(`${indent}end`);
      break;
    }

    case "autonumber": {
      const auto = stmt as SequenceAutonumber;
      if (!auto.visible) {
        lines.push(`${indent}autonumber off`);
      } else if (auto.start !== undefined && auto.step !== undefined) {
        lines.push(`${indent}autonumber ${auto.start} ${auto.step}`);
      } else if (auto.start !== undefined) {
        lines.push(`${indent}autonumber ${auto.start}`);
      } else {
        lines.push(`${indent}autonumber`);
      }
      break;
    }

    case "link": {
      const link = stmt as import("../types/sequence.js").SequenceLink;
      lines.push(`${indent}link ${link.actor}: ${link.text} @ ${link.url}`);
      break;
    }

    case "links": {
      const links = stmt as import("../types/sequence.js").SequenceLinks;
      const linksJson = JSON.stringify(links.links);
      lines.push(`${indent}links ${links.actor}: ${linksJson}`);
      break;
    }

    case "properties": {
      const props = stmt as import("../types/sequence.js").SequenceProperties;
      const propsJson = JSON.stringify(props.properties);
      lines.push(`${indent}properties ${props.actor}: ${propsJson}`);
      break;
    }

    case "details": {
      const details = stmt as import("../types/sequence.js").SequenceDetails;
      lines.push(`${indent}details ${details.actor}: ${details.details}`);
      break;
    }
  }

  return lines;
}

/**
 * Render actor declaration
 */
function renderActor(actor: SequenceActor): string {
  const keyword = actor.type === "actor" ? "actor" : "participant";
  const created = actor.created ? "create " : "";
  
  if (actor.alias && actor.alias !== actor.id) {
    return `    ${created}${keyword} ${actor.id} as ${actor.name}`;
  }
  
  if (actor.name !== actor.id) {
    return `    ${created}${keyword} ${actor.id} as ${actor.name}`;
  }
  
  return `    ${created}${keyword} ${actor.id}`;
}

/**
 * Render a box with its actors
 */
function renderBox(box: SequenceBox, ast: SequenceAST): string[] {
  const lines: string[] = [];
  
  let boxLine = "    box";
  if (box.color) {
    boxLine += ` ${box.color}`;
  }
  if (box.text) {
    boxLine += ` ${box.text}`;
  }
  lines.push(boxLine);
  
  for (const actorId of box.actors) {
    const actor = ast.actors.get(actorId);
    if (actor) {
      lines.push("    " + renderActor(actor));
    }
  }
  
  lines.push("    end");
  
  return lines;
}

/**
 * Render a SequenceAST to Mermaid syntax
 * 
 * Note: When a message has activate/deactivate flags (from shortcut syntax like ->>+ or -->>-),
 * the parser also creates separate activate/deactivate statements. We need to skip these
 * redundant statements to avoid duplication when re-parsing.
 */
export function renderSequence(ast: SequenceAST): string {
  const lines: string[] = [];
  
  // Header
  lines.push("sequenceDiagram");
  
  // Track which actors have been rendered (in boxes)
  const renderedActors = new Set<string>();
  
  // Render boxes first
  for (const box of ast.boxes) {
    lines.push(...renderBox(box, ast));
    for (const actorId of box.actors) {
      renderedActors.add(actorId);
    }
  }
  
  // Render remaining actors
  for (const [actorId, actor] of ast.actors) {
    if (!renderedActors.has(actorId) && !actor.created) {
      lines.push(renderActor(actor));
    }
  }
  
  // Render statements, skipping redundant activate/deactivate statements
  // that follow messages with activate/deactivate flags
  for (let i = 0; i < ast.statements.length; i++) {
    const stmt = ast.statements[i];
    const prevStmt = i > 0 ? ast.statements[i - 1] : null;
    
    // Skip activate statement if previous message already has activate flag for same actor
    if (stmt.type === "activate" && prevStmt?.type === "message") {
      const msg = prevStmt as SequenceMessage;
      const activation = stmt as SequenceActivation;
      if (msg.activate && msg.to === activation.actor) {
        continue; // Skip - the + in the arrow already handles this
      }
    }
    
    // Skip deactivate statement if previous message already has deactivate flag for same actor
    if (stmt.type === "deactivate" && prevStmt?.type === "message") {
      const msg = prevStmt as SequenceMessage;
      const deactivation = stmt as SequenceActivation;
      if (msg.deactivate && msg.from === deactivation.actor) {
        continue; // Skip - the - in the arrow already handles this
      }
    }
    
    lines.push(...renderStatement(stmt, "    "));
  }
  
  return lines.join("\n");
}