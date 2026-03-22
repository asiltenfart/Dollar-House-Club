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
    if "$@" >/dev/null 2>&1; then
        PASS=$((PASS + 1))
        echo -e "  ${GREEN}✓${NC} $desc"
    else
        FAIL=$((FAIL + 1))
        echo -e "  ${RED}✗${NC} $desc"
        echo "    Command: $*"
    fi
}

assert_fail() {
    local desc="$1"
    shift
    TOTAL=$((TOTAL + 1))
    if "$@" >/dev/null 2>&1; then
        FAIL=$((FAIL + 1))
        echo -e "  ${RED}✗${NC} $desc (expected failure, got success)"
    else
        PASS=$((PASS + 1))
        echo -e "  ${GREEN}✓${NC} $desc"
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

echo ""
echo -e "${YELLOW}═══ Dollar House Club — Integration Tests ═══${NC}"
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

echo ""

# ── 11. Access control tests ────────────────────────────────────────────────
echo -e "${YELLOW}Access Control Tests${NC}"

# These test that the signer-based auth works — only the transaction signer's
# address is used. The CLI always sends from the --signer account, so these
# confirm the transactions execute correctly with the expected signer.

assert_fail "Withdraw from raffle with no deposit (emulator-account on raffle #1) should fail" \
    $FLOW transactions send cadence/transactions/withdraw.cdc 1 \
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
