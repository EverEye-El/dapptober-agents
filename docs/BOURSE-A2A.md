# Bourse bilateral service extension v1

URI: `https://github.com/EverEye-El/dapptober-agents/blob/main/docs/BOURSE-A2A.md`.

Implements the A2A 1.0 HTTP+JSON binding, with `POST {interface}/message:send`, `GET {interface}/tasks/{id}`, published agent cards, interrupted negotiation tasks and completed delivery artifacts. Streaming/push are explicitly false. This is a bounded service extension, not a universal A2A client or full optional-operation implementation. Unsupported routes return ordinary HTTP 404/405. Only JSON data parts are accepted. No files or remote URLs are fetched from messages.

Agent cards advertise this required extension in `capabilities.extensions`. Its params bind `chainId`, `registry`, `agentId`, `wallet`, `mode`. Remote cards must match the operator-reviewed endpoint, skill and identity. Private bearer tokens are scoped to one seller's private workspace, intended for one buyer/operator; this is not a public multi-tenant marketplace. Do not share these credentials across unrelated clients. Production endpoints must use HTTPS. In demo, no bearer authentication is required.

## Message payload

```json
{
  "message": {
    "messageId": "a-new-UUID",
    "role": "ROLE_USER",
    "parts": [{"data": {
      "operation": "offer",
      "brief": "Translate into French: Hello world",
      "terms": {
        "id": "bytes32 order ID",
        "buyer": "EVM wallet", "seller": "EVM wallet",
        "buyerId": "1", "sellerId": "2",
        "taskHash": "keccak256 UTF-8 brief",
        "amount": "4000000",
        "deliverBy": 1792200000,
        "expires": 1792198500
      }
    }}]
  }
}
```

`terms` contains exact EIP-712 `Offer` fields; amount is six-decimal USDC atomic units. The buyer sets one immutable brief/hash, seller, budget and deadline mandate per order. Each negotiation step is one offer task. Offer output metadata includes `verdict` (accept/counter/reject, raw model confidence/distribution when real), `price`, and `minutes`. Accepted offers also return unchanged `terms` and real seller `signature`. Sender cannot change task content by changing prose alone. A counter beyond the mandate terminates without funds. The buyer has six rounds. Low confidence (<0.85) requires separate human acknowledgment before funding. These are app thresholds, not measured correctness guarantees.

Continuation with an existing `taskId` is accepted only for interrupted tasks and a matching context; history is appended. Completed/rejected tasks cannot be continued. New message IDs are UUIDs; reusing one with an altered request is rejected. Exact retries return the same saved task. `GET` returns the Task directly (not a SendMessage wrapper). Tasks and idempotency records live in the seller namespace, independently from buyer state. A seller retains up to 256 message records; export/rotate the namespace rather than deleting financial evidence.

`operation: "execute"` uses identical brief/terms and requires an exact funded escrow onchain before provider work. Returns a completed Task with one text artifact and metadata `outputHash`, `signature`. Hash is keccak256 of exact UTF-8 artifact; signature is EIP-712 `Delivery(bytes32 id,bytes32 outputHash)` using domain `BotBourse`, version `1`, configured chain and escrow. A real caller anchors this signed delivery with `deliver`, then the buyer confirms or disputes. Model output cannot trigger funding or release.

No remote arbitrary endpoint from a request/card is followed. Only server-configured exact endpoints are fetched, with redirect rejection, timeouts and 64 KiB response cap. Operator must review DNS/host ownership and apply hosting egress controls; config is trusted administrative input, not an open URL submission form. Bearer credentials are never sent to a redirected destination. External services must implement this extension; generic A2A capability does not imply Bourse compatibility.

## Authority and recovery

Owner browser wallet sends exact bounded transactions; no buyer signer on server. Local seller keys sign offers/delivery only. USDC escrow binds task, amount, parties, identities, chain, contract and expiry. ERC-8004 wallets are checked at discovery/funding and contract `open`. Following a funded deal, the original seller remains the payee; subsequent registry transfer does not redirect escrow. Local seller execution stops if registry authority changed, allowing missed-delivery refund. Protect seller keys against fraudulent delivery signatures.

Undelivered deadline: anyone can refund all USDC to the original buyer. Delivered: buyer may immediately confirm, or dispute within 24h. Anyone may release to original seller once that review window ends. Arbiter may split a dispute; after 7 days unresolved anyone can trigger 50/50. Monitor these windows. App receipt verification checks exact sender, destination, calldata, value and successful mined receipt; direct contract operations remain available if hosting/database is down. A hash proves content integrity and seller authorization, not work quality.
