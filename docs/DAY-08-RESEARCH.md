# Day 08 research and acceptance — 2026-10-08

Read the entire master specification and complete canonical Day 08 prompt in `prompts/dapp-prompts.ts` before implementation. Inspected live https://www.dapptober.xyz/dapp/8 via public HTML. Brief, holographic Roman senate aesthetic and four core features agree; live Jev is optional while canonical requires override flags and model routing, which this build retains. The live site explicitly allows stack substitutions.

Official sources researched:
- https://docs.openzeppelin.com/contracts/5.x/governance — Governor proposal/snapshot/active/success/execution lifecycle, timestamp clocks and delegation.
- https://docs.openzeppelin.com/contracts/5.x/api/governance — GovernorCountingOverridable and VotesExtended provide actual delegator overrides and subtract overridden balances from delegate votes, including overrides cast before a delegate votes.
- Installed OpenZeppelin 5.6.1 source inspected completely for GovernorCountingOverridable and VotesExtended before implementation; override vote and signature APIs are not guessed.

Decision: reuse existing Jev / provider-routed AI and PostgreSQL rather than adding an ElizaOS runtime or a second Snapshot voting backend. OpenZeppelin Governor is the single onchain outcome authority. Fixed, nontransferable equal membership voice tokens with timestamp checkpoints; members individually delegate to their own narrowly funded agent signer. The governor reserves a human-only tail: agents may not cast late, humans can override until the deadline. Governs symbolic policy resolutions only, with no arbitrary fund transfers. This limits signer authority while delivering actual DAO proposal/vote/execute functionality.

Acceptance: each member can register a signed public value profile and control their delegate; distinct delegate agents debate and reply in archived public transcripts; Jev routes full reasoning versus summarization and flags review; provisional onchain votes remain overridable, with contract-enforced late-agent cutoff and immutable vote snapshot; human wallet can override independently of the operator; outcome and alignment dashboard uses actual chain tallies; explicit offline simulation has matching lifecycle without fabricated transaction hashes; independent Day 08 app/deployment, shared governance capability, tests, regressions, builds and final audit.
