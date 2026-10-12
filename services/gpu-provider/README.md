# GPU provider worker

An independently runnable Node service for Day 11 compute delivery. It reads funded jobs from `GpuNightMarket`, checks provider/model/input commitments, calls Ollama `/api/generate` with `stream:false`, durably stores output, submits provider-only delivery and returns output after the transaction succeeds. It supports authenticated retries, a public health endpoint and public WebSocket `/status` telemetry. Telemetry includes only provider/model/capacity/uptime, never prompts, output or bearer credentials.

```sh
pnpm install --frozen-lockfile
cp services/gpu-provider/.env.example services/gpu-provider/.env.local
cd services/gpu-provider
node --env-file=.env.local server.mjs
```

Fill the annotated private file with actual market, provider signer and bearer token. Run Ollama with the configured model already pulled. Only the provider signing key belongs on leased compute; never put the buyer or owner key there. Fund that provider with ETH for delivery gas. The provider is trusted to generate the output it commits; this service provides no TEE or GPU hardware attestation. Process-reported uptime is distinct from marketplace-observed availability and chain delivery statistics.

Build from root: `docker build -f services/gpu-provider/Dockerfile -t gpu-provider .`. Mount persistent storage at `/app/.outputs`; each file is keyed by chain/market/job. Output is saved before sending delivery, so failed broadcasts retry without repeating inference and paid-job retries return the identical committed output. Back up output storage: if a paid output file is lost, the service cannot reconstruct it honestly. Signing transactions are serialized to avoid nonce races; inference slots are bounded.

## Akash GPU deployment

`deploy.yaml` is an SDL 2.0 reference requesting an NVIDIA RTX4090 for Ollama, plus a CPU worker service and persistent output storage. Publish the worker image, pin reviewed worker/Ollama image digests and replace deployment placeholders privately. Verify available placement/storage classes, lease pricing and GPU driver compatibility through the current Akash console before spending. The Akash lease uses its own network/payment mechanism; Base USDC pays per-job providers, not the lease itself.

Expose the worker behind verified HTTPS with optional WSS `/status`; expose Ollama only to the worker's internal service network. Configure ingress/request rate limits and protect the private token. Configure `GPU_WORKER_SLOTS` to the capacity advertised onchain; loading GPU models and inspecting `nvidia-smi`/Ollama `size_vram` must be part of live acceptance. The local HTTP integration uses an explicitly mocked Ollama server and is not evidence of actual GPU execution or an Akash lease.

The worker rejects incorrect commitments, foreign/expired/terminal jobs and requests without the bearer token. Inference failure leaves the escrow pending; expiry refunds go to the buyer. An error during payout confirmation may follow a mined transaction, so always reconcile chain status before refund/retry. Establish provider output retention, backups, monitoring, key handling and a narrow funded signer before opening public service.
