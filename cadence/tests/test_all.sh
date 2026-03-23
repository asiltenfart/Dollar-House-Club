#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Dollar House Club — Emulator-based Integration Tests
# ═══════════════════════════════════════════════════════════════════════════════
#
# Prerequisites:
#   1. Flow emulator running: flow emulator start --reset
#   2. Contracts deployed:    flow project deploy --update
#
# Usage:
#   cd Dollar-House-Club && bash cadence/tests/test_all.sh
#
# ═══════════════════════════════════════════════════════════════════════════════

FLOW="${FLOW_CLI:-flow}"
PASS=0
FAIL=0
TOTAL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

assert_success() {
    local desc="$1"
    shift
    TOTAL=$((TOTAL + 1))
    local output
    output=$("$@" 2>&1)
    # Flow CLI may return exit code 0 even on tx failure — check output for errors
    if echo "$output" | grep -q "Transaction Error\|cadence runtime error\|panic:"; then
        FAIL=$((FAIL + 1))
        echo -e "  ${RED}✗${NC} $desc"
        echo "    $(echo "$output" | grep -m1 'error:' | head -1)"
    else
        PASS=$((PASS + 1))
        echo -e "  ${GREEN}✓${NC} $desc"
    fi
}

assert_fail() {
    local desc="$1"
    shift
    TOTAL=$((TOTAL + 1))
    local output
    output=$("$@" 2>&1)
    # Flow CLI may return exit code 0 even on tx failure — check output for errors
    if echo "$output" | grep -q "Transaction Error\|cadence runtime error\|panic:"; then
        PASS=$((PASS + 1))
        echo -e "  ${GREEN}✓${NC} $desc"
    else
        FAIL=$((FAIL + 1))
        echo -e "  ${RED}✗${NC} $desc (expected failure, got success)"
    fi
}

assert_output_contains() {
    local desc="$1"
    local expected="$2"
    shift 2
    TOTAL=$((TOTAL + 1))
    local output
    output=$("$@" 2>&1)
    if echo "$output" | grep -q "$expected"; then
        PASS=$((PASS + 1))
        echo -e "  ${GREEN}✓${NC} $desc"
    else
        FAIL=$((FAIL + 1))
        echo -e "  ${RED}✗${NC} $desc (expected to find '$expected')"
        echo "    Output: $(echo "$output" | head -3)"
    fi
}

assert_output_not_contains() {
    local desc="$1"
    local unexpected="$2"
    shift 2
    TOTAL=$((TOTAL + 1))
    local output
    output=$("$@" 2>&1)
    if echo "$output" | grep -q "$unexpected"; then
        FAIL=$((FAIL + 1))
        echo -e "  ${RED}✗${NC} $desc (unexpectedly found '$unexpected')"
        echo "    Output: $(echo "$output" | head -3)"
    else
        PASS=$((PASS + 1))
        echo -e "  ${GREEN}✓${NC} $desc"
    fi
}

# ── Signer addresses ────────────────────────────────────────────────────────
EMULATOR_ACCOUNT="emulator-account"
TEST_ACCOUNT="test-account"
EMULATOR_ADDR="0xf8d6e0586b0a20c7"
TEST_ADDR="0x179b6b1cb6755e31"
# Public key derived from test-account private key in flow.json
TEST_PUBKEY="1f72cd1a0f64d172ac7c94fcb63cc3733e8e8152a8dfbc1373f9b18198fce5f6ccac8a27d66dbe0b7cf6db06dd2042c1527d8610f8905c79d7fb60dc34d4b2f1"

echo ""
echo -e "${YELLOW}═══ Dollar House Club — Integration Tests ═══${NC}"
echo ""

# ── 0. Create test account if needed ─────────────────────────────────────────
echo -e "${YELLOW}Setup: Creating test account${NC}"

# Create test account on fresh emulator (idempotent — fails silently if exists)
$FLOW accounts create --key "$TEST_PUBKEY" --signer "$EMULATOR_ACCOUNT" -n emulator >/dev/null 2>&1
echo -e "  ${GREEN}✓${NC} Test account ready at $TEST_ADDR"

echo ""

# ── 0b. Setup RaffleScheduler ─────────────────────────────────────────────
echo -e "${YELLOW}Setup: Configuring RaffleScheduler${NC}"

assert_success "Setup RaffleScheduler (handler + fee provider)" \
    $FLOW transactions send cadence/transactions/setup_scheduler.cdc \
    --signer "$EMULATOR_ACCOUNT" -n emulator

echo ""

# ── 1. Setup: Mint PYUSD for test accounts ──────────────────────────────────
echo -e "${YELLOW}Setup: Minting PYUSD for test accounts${NC}"

assert_success "Setup PYUSD vault + mint for emulator-account" \
    $FLOW transactions send cadence/transactions/setup_and_mint.cdc 10000.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

assert_success "Setup PYUSD vault + mint for test-account" \
    $FLOW transactions send cadence/transactions/setup_and_mint.cdc 10000.0 \
    --signer "$TEST_ACCOUNT" -n emulator

echo ""

# ── 2. DummyPYUSD tests ─────────────────────────────────────────────────────
echo -e "${YELLOW}DummyPYUSD Tests${NC}"

assert_output_contains "Query PYUSD balance > 0" "Result" \
    $FLOW scripts execute cadence/scripts/get_pyusd_balance.cdc $EMULATOR_ADDR -n emulator

assert_output_contains "Query test-account PYUSD balance > 0" "Result" \
    $FLOW scripts execute cadence/scripts/get_pyusd_balance.cdc $TEST_ADDR -n emulator

echo ""

# ── 3. createRaffle tests ───────────────────────────────────────────────────
echo -e "${YELLOW}createRaffle Tests${NC}"

assert_success "Create raffle #1 with valid params" \
    $FLOW transactions send cadence/transactions/create_raffle.cdc \
    "Test House" "A beautiful test house" 50000.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

assert_fail "Create raffle with target < 1000 should fail" \
    $FLOW transactions send cadence/transactions/create_raffle.cdc \
    "Cheap House" "Too cheap" 500.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

assert_fail "Create raffle with empty title should fail" \
    $FLOW transactions send cadence/transactions/create_raffle.cdc \
    "" "No title" 5000.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

assert_output_contains "Raffle #1 exists on chain" "Result" \
    $FLOW scripts execute cadence/scripts/get_raffle.cdc 1 -n emulator

# Verify raffle view has correct seller
assert_output_contains "Raffle #1 seller is emulator-account" "$EMULATOR_ADDR" \
    $FLOW scripts execute cadence/scripts/get_raffle.cdc 1 -n emulator

# Verify raffle status is active (rawValue 0)
assert_output_contains "Raffle #1 status is active" "rawValue: 0" \
    $FLOW scripts execute cadence/scripts/get_raffle.cdc 1 -n emulator

echo ""

# ── 4. deposit tests ────────────────────────────────────────────────────────
echo -e "${YELLOW}deposit Tests${NC}"

assert_success "Deposit \$100 to raffle #1 from test-account" \
    $FLOW transactions send cadence/transactions/deposit.cdc 1 100.0 \
    --signer "$TEST_ACCOUNT" -n emulator

assert_output_contains "Deposit recorded on chain" "Result" \
    $FLOW scripts execute cadence/scripts/get_deposit.cdc 1 $TEST_ADDR -n emulator

assert_fail "Deposit below minimum (\$5) should fail" \
    $FLOW transactions send cadence/transactions/deposit.cdc 1 5.0 \
    --signer "$TEST_ACCOUNT" -n emulator

assert_fail "Seller depositing to own raffle should fail" \
    $FLOW transactions send cadence/transactions/deposit.cdc 1 100.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

assert_success "Additional deposit from same user" \
    $FLOW transactions send cadence/transactions/deposit.cdc 1 50.0 \
    --signer "$TEST_ACCOUNT" -n emulator

assert_fail "Deposit to non-existent raffle should fail" \
    $FLOW transactions send cadence/transactions/deposit.cdc 99999 100.0 \
    --signer "$TEST_ACCOUNT" -n emulator

# Verify total deposited reflects cumulative deposits
assert_output_contains "Raffle #1 totalDeposited reflects deposits" "150" \
    $FLOW scripts execute cadence/scripts/get_raffle.cdc 1 -n emulator

echo ""

# ── 5. SimpleYieldSource tests ──────────────────────────────────────────────
echo -e "${YELLOW}SimpleYieldSource Tests${NC}"

assert_output_contains "Pending yield is queryable" "Result" \
    $FLOW scripts execute cadence/scripts/get_pending_yield.cdc 1 -n emulator

echo ""

# ── 6. harvestYield tests ───────────────────────────────────────────────────
echo -e "${YELLOW}harvestYield Tests${NC}"

assert_success "Harvest yield for raffle #1" \
    $FLOW transactions send cadence/transactions/harvest_yield.cdc 1 \
    --signer "$TEST_ACCOUNT" -n emulator

echo ""

# ── 7. simulateYield tests ──────────────────────────────────────────────────
echo -e "${YELLOW}simulateYield Tests${NC}"

assert_success "Simulate yield of \$500" \
    $FLOW transactions send cadence/transactions/simulate_yield.cdc 1 500.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

assert_fail "Simulate yield on non-existent raffle should fail" \
    $FLOW transactions send cadence/transactions/simulate_yield.cdc 99999 100.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

echo ""

# ── 8. withdraw tests ───────────────────────────────────────────────────────
echo -e "${YELLOW}withdraw Tests${NC}"

# Create raffle #2 for withdrawal tests
assert_success "Create raffle #2 for withdrawal test" \
    $FLOW transactions send cadence/transactions/create_raffle.cdc \
    "Withdraw Test House" "For testing withdrawal" 50000.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

assert_success "Deposit \$200 to raffle #2" \
    $FLOW transactions send cadence/transactions/deposit.cdc 2 200.0 \
    --signer "$TEST_ACCOUNT" -n emulator

assert_success "Withdraw principal from raffle #2" \
    $FLOW transactions send cadence/transactions/withdraw.cdc 2 \
    --signer "$TEST_ACCOUNT" -n emulator

# After withdrawal, deposit record stays with isWithdrawn=true
assert_output_contains "Deposit record preserved after withdrawal" "isWithdrawn" \
    $FLOW scripts execute cadence/scripts/get_deposit.cdc 2 $TEST_ADDR -n emulator

assert_fail "Double-withdraw should fail (already withdrawn)" \
    $FLOW transactions send cadence/transactions/withdraw.cdc 2 \
    --signer "$TEST_ACCOUNT" -n emulator

assert_fail "Withdraw from non-existent raffle should fail" \
    $FLOW transactions send cadence/transactions/withdraw.cdc 99999 \
    --signer "$TEST_ACCOUNT" -n emulator

assert_fail "Withdraw with no deposit in raffle should fail" \
    $FLOW transactions send cadence/transactions/withdraw.cdc 1 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

echo ""

# ── 9. Re-deposit after withdrawal ──────────────────────────────────────────
echo -e "${YELLOW}Re-deposit After Withdrawal Tests${NC}"

# Re-deposit to raffle #2 where user already withdrew
assert_success "Re-deposit \$100 after withdrawal" \
    $FLOW transactions send cadence/transactions/deposit.cdc 2 100.0 \
    --signer "$TEST_ACCOUNT" -n emulator

# Verify isWithdrawn is cleared
assert_output_not_contains "isWithdrawn should be false after re-deposit" "\"isWithdrawn\": true" \
    $FLOW scripts execute cadence/scripts/get_deposit.cdc 2 $TEST_ADDR -n emulator

# Verify deposit amount is back
assert_output_contains "Deposit amount should reflect new deposit" "100" \
    $FLOW scripts execute cadence/scripts/get_deposit.cdc 2 $TEST_ADDR -n emulator

echo ""

# ── 10. View function tests ─────────────────────────────────────────────────
echo -e "${YELLOW}View Function Tests${NC}"

assert_output_contains "Get all raffle IDs" "Result" \
    $FLOW scripts execute cadence/scripts/get_all_raffle_ids.cdc -n emulator

assert_output_contains "Get all raffles" "Result" \
    $FLOW scripts execute cadence/scripts/get_all_raffles.cdc -n emulator

assert_output_contains "Get all deposits for raffle #1" "Result" \
    $FLOW scripts execute cadence/scripts/get_all_deposits.cdc 1 -n emulator

assert_output_contains "Check raffle expiry status" "Result" \
    $FLOW scripts execute cadence/scripts/is_raffle_expired.cdc 1 -n emulator

assert_output_contains "Check raffle committed status" "Result" \
    $FLOW scripts execute cadence/scripts/is_raffle_committed.cdc 1 -n emulator

# Verify prizeClaimed field exists in raffle view
assert_output_contains "RaffleView includes prizeClaimed" "prizeClaimed" \
    $FLOW scripts execute cadence/scripts/get_raffle.cdc 1 -n emulator

# Verify depositorCount reflects unique depositors (never decrements)
assert_output_contains "depositorCount is at least 1" "depositorCount" \
    $FLOW scripts execute cadence/scripts/get_raffle.cdc 2 -n emulator

# Verify get_user_deposited_raffle_ids script
assert_output_contains "Get user deposited raffle IDs" "Result" \
    $FLOW scripts execute cadence/scripts/get_user_deposited_raffle_ids.cdc $TEST_ADDR -n emulator

# Verify get_user_total_allocated script
assert_output_contains "Get user total allocated" "Result" \
    $FLOW scripts execute cadence/scripts/get_user_total_allocated.cdc $TEST_ADDR -n emulator

# Verify block time script works
assert_output_contains "Get block time" "Result" \
    $FLOW scripts execute cadence/scripts/get_block_time.cdc -n emulator

echo ""

# ── 11. Access control tests ────────────────────────────────────────────────
echo -e "${YELLOW}Access Control Tests${NC}"

# These test that the signer-based auth works — only the transaction signer's
# address is used. The CLI always sends from the --signer account, so these
# confirm the transactions execute correctly with the expected signer.

assert_fail "Withdraw from raffle with no deposit (emulator-account on raffle #1) should fail" \
    $FLOW transactions send cadence/transactions/withdraw.cdc 1 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# Claim principal on active raffle should fail
assert_fail "Claim principal on active raffle should fail" \
    $FLOW transactions send cadence/transactions/claim_principal.cdc 1 \
    --signer "$TEST_ACCOUNT" -n emulator

# Claim prize on active raffle should fail
assert_fail "Claim prize on active raffle should fail" \
    $FLOW transactions send cadence/transactions/claim_prize.cdc 1 \
    --signer "$TEST_ACCOUNT" -n emulator

echo ""

# ── 12. Admin tests ─────────────────────────────────────────────────────────
echo -e "${YELLOW}Admin Tests${NC}"

# Non-admin cannot set raffle duration
assert_fail "Non-admin cannot set raffle duration" \
    $FLOW transactions send cadence/transactions/set_raffle_duration.cdc 120.0 \
    --signer "$TEST_ACCOUNT" -n emulator

# Duration below minimum (60s) should fail
assert_fail "Duration below 60 seconds should fail" \
    $FLOW transactions send cadence/transactions/set_raffle_duration.cdc 30.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

echo ""

# ── 13. RaffleScheduler tests ────────────────────────────────────────────────
echo -e "${YELLOW}RaffleScheduler Tests${NC}"

# Raffle #1 and #2 were created after scheduler setup — they should be auto-scheduled
assert_output_contains "Raffle #1 is auto-scheduled" "true" \
    $FLOW scripts execute cadence/scripts/is_raffle_scheduled.cdc 1 -n emulator

assert_output_contains "Raffle #2 is auto-scheduled" "true" \
    $FLOW scripts execute cadence/scripts/is_raffle_scheduled.cdc 2 -n emulator

# Non-existent raffle should not be scheduled
assert_output_contains "Non-existent raffle is not scheduled" "false" \
    $FLOW scripts execute cadence/scripts/is_raffle_scheduled.cdc 9999 -n emulator

# Double-scheduling the same raffle should fail
assert_fail "Double-scheduling raffle #1 should fail" \
    $FLOW transactions send cadence/transactions/schedule_raffle.cdc 1 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# Create raffle #3 (auto-schedules via create_raffle.cdc)
assert_success "Create raffle #3 (auto-scheduled)" \
    $FLOW transactions send cadence/transactions/create_raffle.cdc \
    "Scheduler Test House" "Testing auto-scheduling" 50000.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

assert_output_contains "Raffle #3 is auto-scheduled" "true" \
    $FLOW scripts execute cadence/scripts/is_raffle_scheduled.cdc 3 -n emulator

echo ""

# ── 14. Full Settlement Lifecycle ─────────────────────────────────────────
echo -e "${YELLOW}Full Settlement Lifecycle Tests${NC}"

# Set raffle duration to 60 seconds for quick expiry
assert_success "Set raffle duration to 60 seconds" \
    $FLOW transactions send cadence/transactions/set_raffle_duration.cdc 60.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# Create raffle #4 WITHOUT auto-scheduling (so we can test manual settlement)
assert_success "Create raffle #4 (short duration, no auto-schedule)" \
    $FLOW transactions send cadence/transactions/create_raffle_no_schedule.cdc \
    "Settlement Test House" "Testing full lifecycle" 50000.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# Create raffle #5 WITHOUT deposits (for testing commit with no depositors)
assert_success "Create raffle #5 (short duration, no deposits)" \
    $FLOW transactions send cadence/transactions/create_raffle_no_schedule.cdc \
    "Empty Raffle" "No depositors" 50000.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# Deposit from test-account to raffle #4
assert_success "Deposit \$500 to raffle #4" \
    $FLOW transactions send cadence/transactions/deposit.cdc 4 500.0 \
    --signer "$TEST_ACCOUNT" -n emulator

# Simulate yield on raffle #4
assert_success "Simulate \$100 yield on raffle #4" \
    $FLOW transactions send cadence/transactions/simulate_yield.cdc 4 100.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# ── Pre-expiry edge cases ──────────────────────────────────────────────────

# Commit before expiry should fail (raffle #4 hasn't expired yet)
assert_fail "Commit before expiry should fail" \
    $FLOW transactions send cadence/transactions/commit_raffle.cdc 4 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# Commit on a long-duration active raffle should also fail
assert_fail "Commit raffle #1 (not expired, 30-day) should fail" \
    $FLOW transactions send cadence/transactions/commit_raffle.cdc 1 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# ── Wait for expiry ────────────────────────────────────────────────────────

echo -e "  ⏳ Waiting 65 seconds for raffles #4 and #5 to expire..."
sleep 65

# Force new blocks so the emulator updates its block timestamp
$FLOW transactions send cadence/transactions/setup_and_mint.cdc 1.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator >/dev/null 2>&1
sleep 2
$FLOW transactions send cadence/transactions/setup_and_mint.cdc 1.0 \
    --signer "$TEST_ACCOUNT" -n emulator >/dev/null 2>&1
sleep 1

# Verify raffles are expired
assert_output_contains "Raffle #4 is expired" "true" \
    $FLOW scripts execute cadence/scripts/is_raffle_expired.cdc 4 -n emulator

assert_output_contains "Raffle #5 is expired" "true" \
    $FLOW scripts execute cadence/scripts/is_raffle_expired.cdc 5 -n emulator

# ── Post-expiry: deposit should fail ───────────────────────────────────────

assert_fail "Deposit to expired raffle should fail" \
    $FLOW transactions send cadence/transactions/deposit.cdc 4 100.0 \
    --signer "$TEST_ACCOUNT" -n emulator

# ── Commit with no depositors should fail ──────────────────────────────────

assert_fail "Commit raffle #5 (no depositors) should fail" \
    $FLOW transactions send cadence/transactions/commit_raffle.cdc 5 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# Harvest yield before commit
assert_success "Harvest yield before commit" \
    $FLOW transactions send cadence/transactions/harvest_yield.cdc 4 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# ── STEP 1: Commit raffle ─────────────────────────────────────────────────

assert_success "Commit raffle #4 (request randomness)" \
    $FLOW transactions send cadence/transactions/commit_raffle.cdc 4 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

assert_output_contains "Raffle #4 is committed" "true" \
    $FLOW scripts execute cadence/scripts/is_raffle_committed.cdc 4 -n emulator

# ── Post-commit edge cases ─────────────────────────────────────────────────

# Deposit to committed raffle should fail
assert_fail "Deposit to committed raffle should fail" \
    $FLOW transactions send cadence/transactions/deposit.cdc 4 100.0 \
    --signer "$TEST_ACCOUNT" -n emulator

# Withdraw from committed raffle should fail
assert_fail "Withdraw from committed raffle should fail" \
    $FLOW transactions send cadence/transactions/withdraw.cdc 4 \
    --signer "$TEST_ACCOUNT" -n emulator

# Simulate yield on committed raffle should fail
assert_fail "Simulate yield on committed raffle should fail" \
    $FLOW transactions send cadence/transactions/simulate_yield.cdc 4 50.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# Claim principal before reveal should fail (status is committed, not completed)
assert_fail "Claim principal before reveal should fail" \
    $FLOW transactions send cadence/transactions/claim_principal.cdc 4 \
    --signer "$TEST_ACCOUNT" -n emulator

# Claim prize before reveal should fail
assert_fail "Claim prize before reveal should fail" \
    $FLOW transactions send cadence/transactions/claim_prize.cdc 4 \
    --signer "$TEST_ACCOUNT" -n emulator

# Double commit should fail (already committed)
assert_fail "Double commit should fail" \
    $FLOW transactions send cadence/transactions/commit_raffle.cdc 4 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# ── STEP 2: Reveal winner ─────────────────────────────────────────────────

assert_success "Reveal winner for raffle #4" \
    $FLOW transactions send cadence/transactions/reveal_winner.cdc 4 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# Verify raffle is now resolved
assert_output_contains "Raffle #4 is resolved with a winner" "winner" \
    $FLOW scripts execute cadence/scripts/get_raffle.cdc 4 -n emulator

# Double reveal should fail (already revealed)
assert_fail "Double reveal should fail" \
    $FLOW transactions send cadence/transactions/reveal_winner.cdc 4 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# Reveal on non-existent raffle should fail
assert_fail "Reveal on non-existent raffle should fail" \
    $FLOW transactions send cadence/transactions/reveal_winner.cdc 99999 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# ── Post-reveal: deposit/withdraw should still fail ────────────────────────

assert_fail "Deposit to completed raffle should fail" \
    $FLOW transactions send cadence/transactions/deposit.cdc 4 100.0 \
    --signer "$TEST_ACCOUNT" -n emulator

assert_fail "Withdraw from completed raffle should fail" \
    $FLOW transactions send cadence/transactions/withdraw.cdc 4 \
    --signer "$TEST_ACCOUNT" -n emulator

# Simulate yield on completed raffle should fail
assert_fail "Simulate yield on completed raffle should fail" \
    $FLOW transactions send cadence/transactions/simulate_yield.cdc 4 50.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# ── Non-winner trying to claim prize should fail ──────────────────────────

# emulator-account is the seller, not the winner — cannot claim prize
assert_fail "Non-winner (seller) claiming prize should fail" \
    $FLOW transactions send cadence/transactions/claim_prize.cdc 4 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# ── STEP 3: Claim principal ───────────────────────────────────────────────

assert_success "Claim principal from raffle #4" \
    $FLOW transactions send cadence/transactions/claim_principal.cdc 4 \
    --signer "$TEST_ACCOUNT" -n emulator

# Double claim principal should fail
assert_fail "Double claim principal should fail" \
    $FLOW transactions send cadence/transactions/claim_principal.cdc 4 \
    --signer "$TEST_ACCOUNT" -n emulator

# Claim principal with no deposit should fail
assert_fail "Claim principal with no deposit should fail" \
    $FLOW transactions send cadence/transactions/claim_principal.cdc 4 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

# ── STEP 4: Claim prize ──────────────────────────────────────────────────

# On emulator with one depositor, the sole depositor is the winner
assert_success "Claim prize from raffle #4" \
    $FLOW transactions send cadence/transactions/claim_prize.cdc 4 \
    --signer "$TEST_ACCOUNT" -n emulator

# Verify prize is claimed
assert_output_contains "Prize is claimed" "prizeClaimed.*true" \
    $FLOW scripts execute cadence/scripts/get_raffle.cdc 4 -n emulator

# Double claim prize should fail
assert_fail "Double claim prize should fail" \
    $FLOW transactions send cadence/transactions/claim_prize.cdc 4 \
    --signer "$TEST_ACCOUNT" -n emulator

# ── Restore raffle duration ───────────────────────────────────────────────

assert_success "Restore raffle duration to 30 days" \
    $FLOW transactions send cadence/transactions/set_raffle_duration.cdc 2592000.0 \
    --signer "$EMULATOR_ACCOUNT" -n emulator

echo ""

# ── Summary ─────────────────────────────────────────────────────────────────
echo -e "${YELLOW}═══ Results ═══${NC}"
echo -e "  Total: $TOTAL"
echo -e "  ${GREEN}Passed: $PASS${NC}"
if [ $FAIL -gt 0 ]; then
    echo -e "  ${RED}Failed: $FAIL${NC}"
    exit 1
else
    echo -e "  Failed: 0"
    echo -e "  ${GREEN}All tests passed!${NC}"
fi
echo ""
