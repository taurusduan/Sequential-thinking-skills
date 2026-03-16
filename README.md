# sequential-thinking-cli

AI-first sequential thinking CLI for controlled multi-step reasoning.

`sequential-thinking-cli` gives agents a minimal runtime for guided step progression, convergence control, automatic persistence, replay generation, and export.

## Install

```bash
pnpm add -g sequential-thinking-cli
```

After installation, use the `sthink` command.

## Commands

### `sthink start`

Start a session with the minimum required inputs:

```bash
sthink start --name "protocol-review" --goal "clarify runtime boundaries" --mode explore --totalSteps 5
```

Required inputs:

- `name`
- `goal`
- `mode`
- `totalSteps`

Constraints:

- `mode` must be one of `explore`, `branch`, `audit`
- `totalSteps` must be `5` or `8`

### `sthink step`

Advance an existing session:

```bash
sthink step --sessionPath "<session-path>" --content "Break down the protocol boundary first."
```

### `sthink replay`

Generate replay output for a completed session and export it to the current directory:

```bash
sthink replay --sessionPath "<session-path>"
```

## Modes

- `explore`: break down the problem, identify variables, and converge to conclusions
- `branch`: compare a limited set of candidate paths and produce a recommendation
- `audit`: inspect an existing judgment, find gaps, and converge to corrective advice

## Runtime Behavior

- Sessions are automatically persisted
- Convergence pressure increases in later steps
- Completed sessions can generate `replay.md`
- Replay output can be exported to the current directory

## Storage Model

Runtime session state is stored under the user-level state directory for the current platform.

Replay export remains explicit and can write Markdown output to the current directory.

## Relationship to the Skill

The `sequential-thinking` skill defines when and why an agent should enter controlled sequential reasoning.

This npm package provides the executable CLI runtime used by that skill.
