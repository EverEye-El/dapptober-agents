# DAPPTober 2026 — Days 01–06 AI Agent Build

You are acting as the lead engineer, AI agent architect, smart-contract engineer, and product designer for this project.

Your job is to build SIX complete, high-quality, independently runnable AI agents based on the first six challenges from Dapptober 2026.

This is intended to be a ONE-SHOT BUILD.

Do not stop after scaffolding.\
Do not give me six mockups.\
Do not build fake demos where buttons do nothing.\
Do not leave the core agent behavior as TODOs.

Research the challenges, design the architecture, implement them, test them, and leave the repository in a state where I can configure credentials and deploy each agent independently.

The architecture must also anticipate that this project will continue through all 31 days of Dapptober.

---

# 1. READ THE PROVIDED DAPPTober PROMPT FILE FIRST

A file containing the individual Dapptober challenge prompts has been provided in this repository/workspace.

READ THIS FILE BEFORE IMPLEMENTING ANYTHING.

Treat the provided prompt file as the canonical source for the actual requirements of each Dapptober challenge.

The file may contain prompts beyond Days 01–06. If so, read enough of the remaining prompts to understand where the challenge series is going architecturally, but ONLY build Days 01–06 in this task.

Before implementing each agent:

1. Locate its challenge in the provided prompt file.
2. Read the COMPLETE prompt.
3. Extract the actual functional requirements.
4. Identify required protocols, chains, tools, APIs, smart contracts, agent behaviors, guardrails, and UI concepts.
5. Turn those requirements into acceptance criteria.
6. Build against those acceptance criteria.
7. Verify the finished agent against them before declaring it complete.

Do not replace the supplied challenge prompt with your own interpretation of the challenge.

Do not build from the challenge title alone.

The provided prompt file is the canonical specification for WHAT each challenge is asking us to build.

---

# 2. THEN STUDY DAPPTober.xyz

After reading the provided prompt file, go to:

[https://dapptober.xyz](https://dapptober.xyz)

Study the website before writing implementation code.

Open the individual challenge pages for:

01 — Agent Wallet Genesis\
02 — Pay-Per-Prompt Tollbooth\
03 — Agent Passport Office\
04 — MCP Mercenary Guild\
05 — Stablecoin Autopilot\
06 — Intent Calligrapher

Use the live Dapptober site as a secondary source for additional context, including:

- Dapptober UI and visual language
- challenge-specific presentation
- supporting descriptions
- examples
- technical references
- linked resources
- terminology
- protocols mentioned by the challenge
- design direction
- any useful context not contained in the prompt file

SOURCE PRIORITY:

1. PROVIDED DAPPTober PROMPT FILE\
   Canonical challenge requirements.

2. INDIVIDUAL DAPPTober CHALLENGE PAGE\
   Additional context, resources, presentation, terminology, and design direction.

3. CURRENT OFFICIAL DOCUMENTATION\
   Current implementation details for protocols, SDKs, chains, MCP, x402, smart accounts, identity standards, etc.

If the prompt file and live Dapptober page appear to conflict, inspect both carefully.

Preserve the requirements from the supplied prompt file and document the discrepancy rather than silently choosing one.

If a current protocol or SDK has changed since the prompt was written, preserve the INTENT of the Dapptober requirement while using the current supported implementation.

Do not guess current SDK APIs.

Research official documentation where necessary.

---

# 3. STUDY THE DAPPTober DESIGN LANGUAGE

Study the Dapptober website closely.

Capture its visual language:

- black / near-black environments
- copper/orange illumination
- terminal/HUD elements
- technical diagrams
- monospace readouts
- bold condensed/distressed typography
- subtle grid/glitch/grime
- cinematic sci-fi control-panel energy
- high-tech industrial interfaces

The individual agents should feel like they belong to the same Dapptober universe without becoming six copies of the same interface.

Think:

SAME UNIVERSE.\
DIFFERENT ROOMS.

Do not make generic AI SaaS dashboards.

Do not default to a purple-gradient startup template.

This is Dapptober.

---

# 4. ARCHITECTURE GOAL

Create ONE scalable monorepo for Dapptober agents.

We will eventually have 31+ agents in this repository.

Each daily agent MUST remain independently:

- runnable
- testable
- buildable
- deployable
- configurable
- understandable

However, reusable capabilities should live in shared packages rather than being copied between agents.

Think of the architecture as:

DAILY AGENTS\
↓\
REUSABLE CAPABILITIES\
↓\
SHARED AGENT INFRASTRUCTURE\
↓\
FUTURE COMPOSABLE SUPER-AGENT

By Day 31, we should be able to combine capabilities from previous agents into a larger agent without rewriting the system.

Design for that future now.

IMPORTANT:

Shared code is desirable.

Shared runtime dependencies between daily agents are NOT.

A deployed Day 05 should not require the Day 01 application server to be running.

Each daily agent should remain a standalone product.

---

# 5. REPOSITORY STRUCTURE

Use a monorepo architecture appropriate for modern TypeScript applications.

A starting direction is:

/\
apps/\
agents/\
day-01-wallet-genesis/\
day-02-pay-per-prompt/\
day-03-agent-passport/\
day-04-mcp-mercenary/\
day-05-stablecoin-autopilot/\
day-06-intent-calligrapher/

packages/\
agent-core/\
agent-tools/\
wallet/\
chain/\
payments/\
identity/\
reputation/\
mcp/\
intents/\
guardrails/\
receipts/\
ui/\
config/\
types/

contracts/

docs/

You may improve this structure if research reveals a better architecture.

IMPORTANT:

Daily apps must NOT become tightly coupled.

Day 05 should never require Day 03's application to be running, for example.

If multiple agents need the same functionality, extract that functionality into a shared package.

Every daily application should have its own environment/config boundary and should be capable of independent deployment.

Use a workspace/package system appropriate for a growing TypeScript monorepo.

The developer experience should make commands like these straightforward:

run Day 01\
run Day 04\
test Day 06\
build Day 03\
build everything\
test everything

Adding Day 07 should require following an established pattern, not redesigning the repository.

---

# 6. TECHNICAL DIRECTION

Prefer a modern TypeScript-first stack.

Use current stable versions appropriate to the project.

For web applications, prefer:

- Next.js
- TypeScript
- Tailwind CSS

For web3 functionality, use modern libraries and current APIs.

If thirdweb is appropriate, use the CURRENT unified `thirdweb` SDK.

Do NOT introduce legacy:

- @thirdweb-dev/react
- @thirdweb-dev/sdk
- ethers v5 patterns

For contracts, Foundry is preferred unless another approach is clearly superior for a particular requirement.

Target Base / Base Sepolia where appropriate to Dapptober.

Use USDC where the challenge requires stablecoin behavior.

For AI functionality, create a clean provider abstraction rather than coupling the entire architecture to one model provider.

For agent functionality, distinguish between:

- reasoning
- tools
- permissions
- wallet authority
- execution
- receipts
- human controls

If MCP is required, implement actual MCP-compatible functionality rather than merely naming a normal REST endpoint "MCP."

Research current official documentation when implementing protocols or APIs whose interfaces may have changed.

Do not guess current SDK APIs.

---

# 7. AGENT 01 — AGENT WALLET GENESIS

Build Day 01 according to the COMPLETE supplied Dapptober prompt.

Core concept:

An AI agent with its own smart wallet.

The user should be able to interact with the agent conversationally while the agent can prepare and execute permitted blockchain actions.

Implement meaningful wallet controls such as:

- wallet creation/connection
- balances
- transaction preparation
- transaction previews
- spend limits
- allowed actions
- human approval where required
- transaction history
- receipts/logging
- guardrails

The UI should make it obvious that this is an AGENT with a wallet, not merely another wallet dashboard.

The agent needs authority.

But that authority must have boundaries.

---

# 8. AGENT 02 — PAY-PER-PROMPT TOLLBOOTH

Build Day 02 according to the COMPLETE supplied Dapptober prompt.

Core behavior:

An AI agent attempts to access a paid API/resource.

The service refuses unpaid access.

The agent discovers the payment requirement, pays the required small USDC toll, retries the request, and receives the resource.

Implement the actual payment/request flow as closely as reasonably possible to the protocol specified by the Dapptober prompt.

The interface should clearly visualize:

REQUEST\
→ PAYMENT REQUIRED\
→ AGENT PAYS\
→ RETRY\
→ ACCESS GRANTED

Expose the transaction/payment receipt.

The payment should not be theater hidden behind a fake animation.

If the Dapptober prompt specifies x402 or another payment protocol, implement that protocol correctly using its current specification.

---

# 9. AGENT 03 — AGENT PASSPORT OFFICE

Build Day 03 according to the COMPLETE supplied Dapptober prompt.

Core concept:

Give an AI agent an onchain identity/passport that another person, service, or agent can inspect before trusting it.

Include meaningful identity/reputation primitives such as:

- agent identity
- wallet/address
- capabilities
- attestations/credentials where appropriate
- reputation/history
- verification state
- trust signals
- activity receipts

The passport should be useful programmatically, not merely a visual profile page.

Another agent or application should be able to inspect/query the passport.

Think beyond:

"Here is the agent's profile."

Think:

"Should I trust this agent enough to transact with it?"

---

# 10. AGENT 04 — MCP MERCENARY GUILD

Build Day 04 according to the COMPLETE supplied Dapptober prompt.

Core concept:

A bounty board where AI agents discover and claim onchain quests through MCP tools and receive payment from escrow.

Implement the real lifecycle:

BOUNTY CREATED\
→ FUNDS ESCROWED\
→ AGENT DISCOVERS QUEST\
→ AGENT CLAIMS QUEST THROUGH MCP\
→ WORK EXECUTED\
→ RESULT SUBMITTED\
→ RESULT VERIFIED / APPROVED\
→ ESCROW RELEASED\
→ AGENT PAID

Build an actual MCP interface/tooling layer appropriate for agent discovery and claiming.

Show the:

- bounty
- agent
- escrow state
- job state
- submission
- verification state
- payment receipt

The AI agent should actually interact with the workflow.

This is an agent with a job.

Not a bounty-board mockup.

---

# 11. AGENT 05 — STABLECOIN AUTOPILOT

Build Day 05 according to the COMPLETE supplied Dapptober prompt.

Core concept:

An AI treasury copilot that can rebalance stablecoins ONLY inside a flight plan established by the human.

The human defines the rules.

The agent operates inside them.

Implement meaningful concepts such as:

- treasury balances
- allocation targets
- permitted assets
- maximum transaction size
- rebalance thresholds
- spending/risk constraints
- proposed actions
- executed actions
- audit log
- pause/disengage control
- emergency kill switch

The most important design principle:

THE AGENT CAN MOVE MONEY.

THE AGENT CANNOT LEAVE THE FLIGHT PLAN.

Make the distinction between agent autonomy and human authority extremely clear.

---

# 12. AGENT 06 — INTENT CALLIGRAPHER

Build Day 06 according to the COMPLETE supplied Dapptober prompt.

Core concept:

The human describes an onchain outcome in plain language.

The agent converts that request into a structured, signed intent.

Solvers can then compete or determine how to satisfy the intent.

Conceptually:

HUMAN LANGUAGE\
→ STRUCTURED INTENT\
→ PREVIEW\
→ SIGNATURE\
→ SOLVER\
→ EXECUTION\
→ RECEIPT

Do not reduce this to a chatbot that generates transaction text.

The structured intent should be inspectable.

Clearly show:

- what the human requested
- what constraints were inferred
- what will be signed
- what solver/path was selected
- what ultimately executed
- the resulting receipt

The interface should make the transformation from human language to machine-executable intent visually understandable.

---

# 13. SHARED AGENT CAPABILITY SYSTEM

This part is extremely important.

Do NOT treat the six applications as six unrelated hackathon projects.

Create reusable capabilities/tools.

For example, the architecture may eventually expose capabilities conceptually like:

wallet.create\
wallet.balance\
wallet.transfer

policy.check\
policy.authorize

payment.request\
payment.pay

identity.resolve\
identity.verify

reputation.read

bounty.discover\
bounty.claim\
bounty.submit

treasury.inspect\
treasury.rebalance

intent.create\
intent.sign\
intent.execute

receipt.create\
receipt.verify

The exact API is yours to design.

The important requirement is that capabilities developed during one Dapptober day can later be composed into another agent.

Where appropriate, design capabilities around clear interfaces/contracts rather than application-specific implementation details.

---

# 14. BUILD TOWARD A DAPPTober AGENT SDK

As this repository grows through Days 07–31, the shared packages should naturally evolve into a reusable Dapptober Agent SDK.

Do not prematurely build a giant framework.

Extract abstractions when real daily agents demonstrate that they are reusable.

The progression should look like:

DAILY BUILD\
→ WORKING CAPABILITY\
→ REUSABLE PACKAGE\
→ AGENT TOOL\
→ COMPOSABLE AGENT SDK

Avoid speculative abstractions that have no working implementation behind them.

But when functionality is genuinely shared, extract it cleanly.

---

# 15. FUTURE DAY 31 COMPOSITION

Assume that after all 31 challenges are complete, we will build a master agent that can potentially:

- hold its own wallet
- pay for resources
- carry an identity/passport
- build reputation
- discover work
- claim bounties
- earn USDC
- manage treasury
- express/sign intents
- interact with other agents
- use MCP tools
- operate across chains
- maintain memory
- produce verifiable receipts
- obey spending policies
- be paused/killed by its human

The architecture created TODAY should make that possible.

Do not build Day 31 yet.

Do not prematurely combine the six agents.

But avoid architectural decisions that make future composition difficult.

---

# 16. REAL FUNCTIONALITY VS DEMO MODE

These applications should work.

However, developer experience matters.

Where external credentials, funded wallets, third-party services, or unavailable infrastructure prevent immediate execution, implement TWO clearly separated modes when appropriate:

REAL MODE

Uses actual:

- blockchain infrastructure
- wallets
- smart contracts
- APIs
- AI providers
- payments
- signatures
- attestations
- protocols

DEMO / LOCAL MODE

Provides deterministic development behavior so the UI and complete workflow can still be tested without requiring funded accounts or external infrastructure.

Never silently pretend demo behavior is real.

Clearly label simulated actions.

Never fabricate:

- transaction hashes
- attestations
- payments
- balances
- signatures
- onchain state
- verification results

and present them as real.

---

# 17. UI / PRODUCT QUALITY

These should look like six polished mini-products, not tutorial examples.

Use the Dapptober visual language as inspiration.

Shared universe.

Different rooms.

Conceptually:

DAY 01\
Wallet genesis / initialization terminal

DAY 02\
Neon tollbooth / payment gateway

DAY 03\
Cyberpunk passport / identity terminal

DAY 04\
Mercenary bounty board / guild operations terminal

DAY 05\
Treasury cockpit / autopilot controls

DAY 06\
Intent drafting / calligraphy-meets-cryptographic-signing terminal

Maintain strong information hierarchy.

Include:

- loading states
- empty states
- errors
- success states
- wallet states
- transaction states
- agent reasoning/action states where appropriate
- useful tooltips/help
- responsive layouts

Avoid generic AI SaaS dashboard aesthetics.

No six identical card grids with different headings.

Each application needs visual personality.

---

# 18. AGENT OBSERVABILITY

Agents need alibis.

Create a consistent event / receipt / logging model.

Important agent actions should produce inspectable records.

Where applicable show:

TIME\
AGENT\
ACTION\
TOOL\
INPUT\
POLICY CHECK\
CHAIN\
TX / SIGNATURE\
RESULT\
STATUS

A human should be able to understand what the agent did and why.

These receipts should eventually be usable across multiple Dapptober agents.

Design accordingly.

---

# 19. SECURITY / GUARDRAILS

Do not give autonomous agents unrestricted control over funds.

Implement sensible safeguards.

Depending on the agent, this can include:

- spend caps
- allowlists
- explicit permissions
- approval thresholds
- transaction previews
- rate limits
- pause controls
- kill switches
- contract-level constraints
- simulation before execution

Secrets must never be committed.

Provide `.env.example` files.

Validate environment variables.

Document security assumptions.

The UI should make agent authority visible.

A human should be able to understand:

WHAT CAN THIS AGENT DO?

WHAT CAN'T IT DO?

WHAT REQUIRES MY APPROVAL?

HOW DO I STOP IT?

---

# 20. TESTING

Each agent needs meaningful tests.

At minimum, test the core workflow for each challenge.

Also test shared packages where appropriate.

Smart contracts require contract tests.

Critical policy/guardrail logic requires tests.

Test important failure cases.

Examples:

- insufficient balance
- payment rejected
- spend limit exceeded
- unauthorized action
- invalid intent
- escrow failure
- failed solver
- paused agent
- unavailable AI provider
- malformed MCP request

Run:

- lint
- typecheck
- tests
- production builds

Fix failures rather than merely documenting them.

---

# 21. DOCUMENTATION

Create a strong root README explaining:

- what Dapptober is
- repository architecture
- available agents
- setup
- environment variables
- running individual agents
- running the entire workspace
- testing
- deploying
- adding the next Dapptober day
- shared capability architecture
- future composition strategy

Each daily agent should also have its own README containing:

DAY NUMBER\
DAPPTober PROMPT\
WHAT IT BUILDS\
ARCHITECTURE\
HOW THE AGENT WORKS\
ONCHAIN COMPONENTS\
AGENT TOOLS\
GUARDRAILS\
ENVIRONMENT VARIABLES\
RUN LOCALLY\
TEST\
DEPLOY\
KNOWN LIMITATIONS

Create architecture documentation explaining how today's six agents can evolve toward the future composed agent.

Also document which functionality has been promoted into shared packages and why.

---

# 22. DEPLOYMENT INDEPENDENCE

This is non-negotiable.

I need to be able to deploy Day 01 without deploying Days 02–06.

I need to be able to deploy Day 06 without deploying Days 01–05.

Shared packages may be compiled into each application, but runtime coupling between daily apps should be avoided.

Each app should have a clear independent deployment path suitable for Vercel or another appropriate platform.

Contracts/services should have equally clear deployment instructions.

Each agent should have its own:

- configuration
- environment requirements
- build command
- deployment instructions

where appropriate.

---

# 23. CONTINUING THROUGH DAYS 07–31

This repository will continue growing as new Dapptober days arrive.

Make adding the next day predictable.

Document the process.

Ideally, adding a new agent follows something conceptually similar to:

1. Read new Dapptober prompt.
2. Extract requirements.
3. Identify reusable existing capabilities.
4. Identify genuinely new capabilities.
5. Create new independent daily application.
6. Reuse shared packages.
7. Build new functionality.
8. Promote reusable functionality into shared packages where justified.
9. Test the daily agent independently.
10. Verify existing agents have not broken.
11. Deploy independently.
12. Update repository documentation.

Do not architect Days 01–06 in a way that makes Days 07–31 increasingly difficult to add.

---

# 24. EXECUTION STYLE

You have authority to make reasonable engineering decisions without repeatedly asking me questions.

Research first.

Then implement.

If the Dapptober site contains additional requirements or resources, incorporate them where appropriate.

If the live website conflicts with the provided prompt file, treat the PROVIDED PROMPT FILE as canonical and document the discrepancy.

If an implementation choice is ambiguous, choose the option that maximizes:

1. actual functionality
2. security
3. composability
4. independent deployability
5. developer experience
6. visual quality

Do not stop to ask me about minor choices.

Do not return only an implementation plan.

Do not spend the entire task describing what you intend to build.

BUILD IT.

Make reasonable decisions.

Test those decisions.

Iterate when something fails.

---

# 25. DEFINITION OF DONE

The task is complete when:

✓ The provided Dapptober prompt file has been read.

✓ The live Dapptober Days 01–06 pages have been inspected.

✓ Requirements have been extracted for all six agents.

✓ Six distinct Dapptober AI agents exist.

✓ Each accurately represents its supplied challenge prompt.

✓ Each can run independently.

✓ Each can be built independently.

✓ Each can be deployed independently.

✓ Core interactions actually work.

✓ Blockchain functionality is real where configured.

✓ AI functionality is real where configured.

✓ Demo behavior is explicitly identified where used.

✓ Shared functionality is properly extracted.

✓ Daily applications are not runtime-dependent on one another.

✓ The UI feels cohesive with the Dapptober universe.

✓ Each agent has its own visual personality.

✓ Agent actions produce receipts/logs.

✓ Guardrails exist around autonomous financial behavior.

✓ Smart contracts are tested.

✓ Critical agent workflows are tested.

✓ Lint passes.

✓ Typechecking passes.

✓ Tests pass.

✓ Production builds pass.

✓ Setup and deployment are documented.

✓ Adding Day 07 follows an obvious repeatable pattern.

✓ The architecture can eventually support composition of Days 01–31 into a larger autonomous agent.

---

# 26. FINAL AUDIT

Before finishing, audit all six applications yourself against the ORIGINAL supplied Dapptober prompts.

For each day, verify:

PROMPT\
→ REQUIREMENTS\
→ IMPLEMENTATION\
→ TEST\
→ WORKING BUILD

Do not tell me something works unless you actually tested it.

Do not mark functionality complete because the UI exists.

Do not confuse a simulated workflow with a real protocol integration.

Report any remaining limitation accurately.

The final repository should feel like the beginning of a serious agent platform, not six disconnected hackathon demos.

GTFOL.

Six agents.\
Six independent deployments.\
One growing capability layer.

Real wallets.\
Real actions.\
Real receipts.

Ship it.
