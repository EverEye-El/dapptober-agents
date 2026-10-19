# Day18 research — Hush

October18,2026. Read the full master build spec and complete canonical Day18 prompt before implementation; inspected `2026SocialPosts/30-day-18.png` and preserved it. The app's booth art crops the supplied graphic. Read installed Next16 route-handler documentation completely before adding the handler.

## Sources and decisions

- [Live Day18](https://www.dapptober.xyz/dapp/18), read in the in-app browser. Same brief/features/vibe as the repository. Its Jev section is optional; the repository canonical feature is implemented, with amount-free category routing and separate narration.
- [Official Fhenix Base announcement](https://www.fhenix.io/blog/fhenix-adds-base-support-to-cofhe----expanding-privacy-to-ethereum-l2): Base Sepolia support, consistent with the user's test chain.
- [Official compatibility matrix](https://cofhe-docs.fhenix.zone/cofhe/get-started/introduction/compatibility): Base Sepolia84532, no Base mainnet entry. Page lists SDK0.8.0/contracts1.0.0; current official npm packages are1.0.0/1.0.1. Installed source, actual tests and release pinning take precedence for APIs. Mainnet remains blocked, not silently replaced.
- [Official end-to-end client example](https://cofhe-docs.fhenix.zone/cofhe/client-sdk/examples/end-to-end): `encryptInputs`, consuming-contract binding, ACP and `decryptForView`; the app never publishes decrypted results.
- [Official encrypted auction example](https://cofhe-docs.fhenix.zone/cofhe/fhe-library/examples/auction-example): encrypted comparisons/select and ACL management. Its illustrative plaintext `bid(uint64)` and public winner disclosure are intentionally unsuitable for this owner-only brief; Hush accepts verified external ciphertexts and grants results only to the creator after deadline.
- [Official contracts repository](https://github.com/FhenixProtocol/cofhe-contracts) and installed `FHE.sol`/`ICofhe.sol`: exact encrypted types, external inputs, euint64 arithmetic, eaddress winner and access-control functions.
- [Official SDK repository](https://github.com/FhenixProtocol/cofhesdk): installed browser/node client, chains, config, ACP storage/scopes/expiry, mock encryption and Foundry plugin inspected. No invented key/service endpoint. FHE key storage set null; ACPs remain SDK-local and disclosed.

## Actual public evidence

Public Base Sepolia read: block48292027, chain84532; official address book `0xC0F4e00E531a2B086492Ae3DCC1515038307196b` has100runtime bytes and resolves TaskManager1 to `0xeA30c4B8b44078Bbf8a6ef5b9f1eC1626C7848D9`.

The opt-in live test also passed a **genuine CoFHE seven-credit synthetic input encryption and verifier signature** using SDK1.0.0, an ephemeral unfunded wallet and no transaction. At observed block48292044, address-book runtime hash was `0x4c937fd1a98796598b156702ec699a8bd3bbd380e2470b6c1a41d606d904f294`. Returned ciphertext handle `0x18f0448830a3c61b1fc84f3210782bb06b381accfbf53bbc9b83d9fb69f57236`; proof65bytes. Proof was bound to the address book as an unused synthetic consumer, **not a deployed Hush app**. No public app operation, decryption, cash movement or onchain settlement is established by this test.

## Scope

One full confidential allocation-credit auction path satisfies the prompt's sealed-bid-or-hidden-order option. Allocations are self-declared private ledger units, not an encrypted cash wrapper. Token custody/financial settlement, order execution and payroll payouts require separate protocol work and must not be implied by a successful demo or encrypted computation. Model routing sees public request category; amounts never influence model-visible payloads/control flow. FHE processing and ACP decryption inherit Fhenix's coprocessor, verifier, ACL and Teecryptor trust assumptions.
