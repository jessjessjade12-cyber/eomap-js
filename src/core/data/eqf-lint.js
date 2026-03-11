import { QUEST_ACTION_NAMES, QUEST_RULE_NAMES } from "./quest-syntax";

// Actions that accept a random block name as their first argument
const RANDOM_REF_ACTIONS = new Set(["giverandomitem"]);
// Rules that accept a random block name as their first argument
const RANDOM_REF_RULES = new Set(["pickuprandomitem", "pickupfakeitem"]);

function blockEndLine(lines, startLine) {
  let depth = 0;
  let foundOpen = false;
  for (let j = startLine; j < lines.length; j++) {
    for (const ch of lines[j]) {
      if (ch === "{") {
        depth++;
        foundOpen = true;
      }
      if (ch === "}") depth--;
    }
    if (foundOpen && depth === 0) return j;
  }
  return lines.length - 1;
}

function parseEqfStructure(text) {
  const lines = text.split("\n");
  const states = [];
  const randoms = [];

  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();

    const stateMatch = trimmed.match(/^State\s+(\S+)/i);
    if (stateMatch) {
      const name = stateMatch[1];
      const startLine = i;
      const actions = [];
      const rules = [];
      let depth = 0;
      let endLine = i;
      let foundOpen = false;

      for (let j = i; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === "{") {
            depth++;
            foundOpen = true;
          }
          if (ch === "}") depth--;
        }
        if (foundOpen && depth > 0) {
          const inner = lines[j].trim();
          if (/^action\s+/i.test(inner)) {
            actions.push({ text: inner, lineNum: j });
          } else if (/^rule\s+/i.test(inner)) {
            rules.push({ text: inner, lineNum: j });
          }
        }
        if (foundOpen && depth === 0) {
          endLine = j;
          break;
        }
      }

      states.push({ name, startLine, endLine, actions, rules });
      i = endLine + 1;
      continue;
    }

    const randomMatch = trimmed.match(/^random\s+(\S+)/i);
    if (randomMatch) {
      const name = randomMatch[1];
      const startLine = i;
      const endLine = blockEndLine(lines, i);
      randoms.push({ name, startLine, endLine });
      i = endLine + 1;
      continue;
    }

    i++;
  }

  return { states, randoms };
}

function extractFirstArg(argString) {
  // Grab the first argument from a call like "FnName(arg1, arg2)"
  const inner = argString.match(/\(([^)]*)\)/);
  if (!inner) return null;
  return inner[1]
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "");
}

function lineRange(doc, lineNum) {
  try {
    const line = doc.line(lineNum + 1);
    return { from: line.from, to: line.to };
  } catch {
    return { from: 0, to: 0 };
  }
}

export function createEqfLinter() {
  return (view) => {
    const doc = view.state.doc;
    const text = doc.toString();
    const diagnostics = [];
    const { states, randoms } = parseEqfStructure(text);

    const lowerStateNames = states.map((s) => s.name.toLowerCase());
    const knownStates = new Set(lowerStateNames.filter((n) => n.length > 0));
    const knownRandoms = new Set(
      randoms.map((r) => r.name.toLowerCase()).filter((n) => n.length > 0),
    );

    // Missing Begin state
    if (!knownStates.has("begin")) {
      const firstLine = doc.line(1);
      diagnostics.push({
        from: firstLine.from,
        to: firstLine.to,
        severity: "error",
        message: 'Missing required state "Begin".',
      });
    }

    // Duplicate state names
    const seenStates = new Map();
    for (const state of states) {
      const lower = state.name.toLowerCase();
      if (seenStates.has(lower)) {
        const { from, to } = lineRange(doc, state.startLine);
        diagnostics.push({
          from,
          to,
          severity: "error",
          message: `Duplicate state name: "${state.name}".`,
        });
      } else {
        seenStates.set(lower, state);
      }
    }

    // Duplicate random names
    const seenRandoms = new Map();
    for (const rnd of randoms) {
      const lower = rnd.name.toLowerCase();
      if (seenRandoms.has(lower)) {
        const { from, to } = lineRange(doc, rnd.startLine);
        diagnostics.push({
          from,
          to,
          severity: "error",
          message: `Duplicate random block name: "${rnd.name}".`,
        });
      } else {
        seenRandoms.set(lower, rnd);
      }
    }

    for (const state of states) {
      const stateLoc = lineRange(doc, state.startLine);

      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(state.name)) {
        diagnostics.push({
          from: stateLoc.from,
          to: stateLoc.to,
          severity: "warning",
          message: `State name "${state.name}" should use only letters, digits, and underscores.`,
        });
      }

      for (const action of state.actions) {
        const { from, to } = lineRange(doc, action.lineNum);
        const commandPart = action.text.replace(/^action\s+/i, "").trim();
        const cmdMatch = commandPart.match(/^([A-Za-z_][A-Za-z0-9_]*)/);
        if (!cmdMatch) continue;

        const cmdLower = cmdMatch[1].toLowerCase();

        if (!QUEST_ACTION_NAMES.has(cmdLower)) {
          diagnostics.push({
            from,
            to,
            severity: "warning",
            message: `Unknown action "${cmdMatch[1]}" in state "${state.name}".`,
          });
          continue;
        }

        // Validate random block references
        if (RANDOM_REF_ACTIONS.has(cmdLower)) {
          const refName = extractFirstArg(commandPart);
          if (refName && !knownRandoms.has(refName.toLowerCase())) {
            diagnostics.push({
              from,
              to,
              severity: "warning",
              message: `Action "${cmdMatch[1]}" references unknown random block "${refName}".`,
            });
          }
        }
      }

      for (const rule of state.rules) {
        const { from, to } = lineRange(doc, rule.lineNum);
        const rulePart = rule.text.replace(/^rule\s+/i, "").trim();

        const cmdMatch = rulePart.match(/^([A-Za-z_][A-Za-z0-9_]*)/);
        if (cmdMatch) {
          const cmdLower = cmdMatch[1].toLowerCase();

          if (!QUEST_RULE_NAMES.has(cmdLower)) {
            diagnostics.push({
              from,
              to,
              severity: "warning",
              message: `Unknown rule "${cmdMatch[1]}" in state "${state.name}".`,
            });
          }

          // Validate random block references in rules
          if (RANDOM_REF_RULES.has(cmdLower)) {
            const refName = extractFirstArg(rulePart);
            if (refName && !knownRandoms.has(refName.toLowerCase())) {
              diagnostics.push({
                from,
                to,
                severity: "warning",
                message: `Rule "${cmdMatch[1]}" references unknown random block "${refName}".`,
              });
            }
          }
        }

        if (!/\bgoto\b/i.test(rulePart)) {
          diagnostics.push({
            from,
            to,
            severity: "error",
            message: `Rule in "${state.name}" is missing "goto".`,
          });
          continue;
        }

        const gotoMatch = rulePart.match(
          /\bgoto\s+"?([A-Za-z_][A-Za-z0-9_]*)"?/i,
        );
        if (!gotoMatch) {
          diagnostics.push({
            from,
            to,
            severity: "error",
            message: `Rule in "${state.name}" has an invalid goto target.`,
          });
          continue;
        }

        if (!knownStates.has(gotoMatch[1].toLowerCase())) {
          diagnostics.push({
            from,
            to,
            severity: "error",
            message: `Rule in "${state.name}" points to unknown state "${gotoMatch[1]}".`,
          });
        }
      }
    }

    return diagnostics;
  };
}
