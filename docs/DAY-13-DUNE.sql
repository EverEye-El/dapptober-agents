-- Dune / Base mainnet: create a saved query, set its text parameter `factory`
-- to the verified AgentLaunchGantry address WITHOUT a 0x prefix, schedule daily.
-- No decoded ABI table is required. API latest-result endpoint must return these columns.
-- RPC contract totals remain authoritative. Sepolia indexing is not assumed.
WITH launches AS (
 SELECT DISTINCT varbinary_substring(topic2,13,20) AS agent
 FROM base.logs
 WHERE contract_address=from_hex('{{factory}}')
 AND topic0=0x75254ece5fc76e54f4838ea6d4bc09081b80fca4a1597f8be997adb2a6d8b0b1
), earned AS (
 SELECT contract_address AS agent,
 SUM(CAST(varbinary_to_uint256(varbinary_substring(data,1,32)) AS DOUBLE)/1e6) AS revenue_usdc
 FROM base.logs
 WHERE topic0=0xe31446cc119248344d9c4c822b36ee0eeb52d5545038ec0d6af92a82e375f56a
 AND contract_address IN (SELECT agent FROM launches)
 GROUP BY 1
), traded AS (
 SELECT contract_address AS agent,
 SUM(CAST(varbinary_to_uint256(varbinary_substring(data,33,32)) AS DOUBLE)/1e6) AS trade_usdc
 FROM base.logs
 WHERE topic0=0x69fd83406168ef35927190021ab940690b846cc0c13e3c76f0a74a83bdaddf9e
 AND contract_address IN (SELECT agent FROM launches)
 GROUP BY 1
)
SELECT 8453 AS chain_id, concat('0x','{{factory}}') AS factory,
 concat('0x',to_hex(l.agent)) AS agent,
 coalesce(e.revenue_usdc,0) AS revenue_usdc,
 coalesce(t.trade_usdc,0) AS trade_usdc
FROM launches l LEFT JOIN earned e ON l.agent=e.agent LEFT JOIN traded t ON l.agent=t.agent
ORDER BY revenue_usdc DESC
LIMIT 200;
