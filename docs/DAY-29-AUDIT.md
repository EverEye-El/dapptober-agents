# Day 29 audit — MAYDAY

October 29, 2026. Dedicated branch `codex/day-29-black-box-recorder`, stacked on Day 28. This app is independently deployable; another daily server is not required.

| Canonical requirement | Implementation and evidence |
| --- | --- |
| Signed hashed prompt/tool/transaction steps | Canonical keccak256 records, chain/index/salt, workspace/chain-bound EOA signatures; tests reject edited/reordered/deleted/wrong-signature/wrong-chain histories |
| Batched onchain Merkle anchoring | 100-entry sorted-pair trees; reviewed EAS transaction; actual official EAS/SchemaRegistry bytecode deployed to Anvil, exact receipt confirmed and attestation read back |
| Timeline replay and drill-down | Step waveform, replay/hold/seek, kind/flag filters, payload/signature/trace/hash inspector; browser loaded five steps and inspected sealed batch |
| Any-range tamper evidence | Range endpoint, chain/signature checks, imported entries, inclusion proofs; bound batches check first/last/head/root/signer and live EAS data |
| Jev flags / tamper assessment | Typed Jev allow/confidence flags; crypto results remain authoritative; bad actions are recorded, never executed by their text; live model calls are not claimed |
| Supabase / OpenTelemetry | Shared durable demo/real store, private sessions/operator desk, instrumented intake and authenticated JSON OTLP route; actual hosted Supabase/collector acceptance remains open |

Local evidence: nine recorder application tests pass, lint/typecheck pass, independent production build passes, genuine EAS local-chain acceptance passes. Browser practice flight → reviewed batch seal → intact verification passes. Local demo seals never fabricate transaction hashes/UIDs. Public-chain, genuine Jev, real Supabase, external collector and hosted release are not verified here.

Limits: authenticated producer assertions need not be true. Signer compromise, unanchored truncation and unavailable offchain records require external trusted checkpoints/backups. Automatic redaction is not complete privacy protection. Incoming OTLP is JSON only, maximum 10 spans/32KB. Internal OpenTelemetry API spans need a host SDK/provider for external export. Action/body/flight/paid quotas are bounded, but public ingress limits and independent review remain release tasks. Shared pending wallet instructions use exact sender/to/calldata/value and two additional confirmations; errors preserve an unconfirmed instruction for recovery.

Live Jev log/batch analysis is disabled until the operator explicitly sets `RECORDER_JEV_METADATA_CONSENT=true` after reviewing redacted step fields and limited integrity/flag-count summaries sent to TypeSafe. Without consent, capture/crypto verification remain available and steps require human review. A test verifies that no external request occurs without consent.
