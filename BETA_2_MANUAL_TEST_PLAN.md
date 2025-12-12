# B2.6.3 - Manual Multi-Lift Test Plan

This document provides a checklist for testing Beta 2 multi-lift functionality on a real device.

## Pre-Test Setup

1. Ensure you have Beta 2.0 installed
2. Clear app data or start fresh (optional, for clean testing)
3. Complete onboarding if starting fresh

---

## Manual Test Checklist

### ✅ Test 1: Bench-Only Logging
**Goal:** Verify bench sets appear only under bench.

**Steps:**
1. Navigate to "Log Training Session"
2. Select "Bench Press" tab
3. Log 2-3 bench sets (e.g., 100kg × 5 reps, RIR 0)
4. End session
5. Navigate to Dashboard

**Expected Result:**
- Dashboard shows bench card with baseline 1RM estimate
- Bench card shows strength category and ratio
- No squat or deadlift data should appear

**Verification:**
- [ ] Bench card displays data
- [ ] Squat card shows "No data available"
- [ ] Deadlift card shows "No data available"

---

### ✅ Test 2: Squat-Only Logging
**Goal:** Verify squat sets appear only under squat.

**Steps:**
1. Navigate to "Log Training Session"
2. Select "Back Squat" tab
3. Log 2-3 squat sets (e.g., 150kg × 5 reps, RIR 0)
4. End session
5. Navigate to Dashboard

**Expected Result:**
- Dashboard shows squat card with baseline 1RM estimate
- Squat card shows strength category and ratio
- Bench and deadlift remain independent

**Verification:**
- [ ] Squat card displays data
- [ ] Bench card still shows previous data (unchanged)
- [ ] Deadlift card shows "No data available"

---

### ✅ Test 3: Deadlift-Only Logging
**Goal:** Verify deadlift sets appear only under deadlift.

**Steps:**
1. Navigate to "Log Training Session"
2. Select "Deadlift (Conventional)" tab
3. Log 2-3 deadlift sets (e.g., 200kg × 5 reps, RIR 0)
4. End session
5. Navigate to Dashboard

**Expected Result:**
- Dashboard shows deadlift card with baseline 1RM estimate
- Deadlift card shows strength category and ratio
- Bench and squat remain independent

**Verification:**
- [ ] Deadlift card displays data
- [ ] Bench card still shows previous data (unchanged)
- [ ] Squat card still shows previous data (unchanged)

---

### ✅ Test 4: Mixed Session (Bench + Squat)
**Goal:** Verify sets are properly separated by liftType.

**Steps:**
1. Navigate to "Log Training Session"
2. Select "Bench Press" tab
3. Log 1 bench set (e.g., 100kg × 5 reps, RIR 0)
4. Switch to "Back Squat" tab
5. Log 1 squat set (e.g., 150kg × 5 reps, RIR 0)
6. End session
7. Navigate to Dashboard

**Expected Result:**
- Both bench and squat cards show updated data
- Each card shows only its respective lift's data
- No cross-lift contamination

**Verification:**
- [ ] Bench card shows bench data only
- [ ] Squat card shows squat data only
- [ ] Deadlift card unchanged (or shows "No data available")
- [ ] Sets are properly separated (no mixing)

---

### ✅ Test 5: Tested 1RM Per Lift
**Goal:** Verify calibration runs per lift independently.

**Steps:**
1. Navigate to Settings → Edit Profile (or Onboarding)
2. Add a tested 1RM for bench (e.g., 120kg)
3. Navigate to Dashboard
4. Verify bench card shows updated estimate
5. Add a tested 1RM for squat (e.g., 180kg)
6. Navigate to Dashboard
7. Verify squat card shows updated estimate

**Expected Result:**
- Each lift's tested 1RM affects only that lift's calibration
- Bench calibration doesn't affect squat
- Squat calibration doesn't affect bench
- Each lift shows independent baseline 1RM

**Verification:**
- [ ] Bench tested 1RM affects only bench estimates
- [ ] Squat tested 1RM affects only squat estimates
- [ ] Deadlift remains independent (if no tested 1RM added)
- [ ] Calibration is per-lift

---

### ✅ Test 6: Dashboard Category Display
**Goal:** Verify each lift shows independent baseline & category.

**Steps:**
1. Navigate to Dashboard
2. Review all three lift cards

**Expected Result:**
- Each card shows:
  - Baseline 1RM ± uncertainty
  - Strength category (e.g., "Intermediate")
  - Ratio (e.g., "1.55× BW")
  - Microcopy (e.g., "Intermediate for your bodyweight")
- Categories are independent per lift
- Ratios are calculated correctly per lift

**Verification:**
- [ ] Bench card shows category, ratio, and microcopy
- [ ] Squat card shows category, ratio, and microcopy
- [ ] Deadlift card shows category, ratio, and microcopy
- [ ] Categories may differ between lifts (expected)
- [ ] Ratios are lift-specific

---

### ✅ Test 7: History Filter
**Goal:** Verify graphs update correctly for each lift.

**Steps:**
1. Navigate to "History"
2. Select "Bench Press" tab
3. Verify graph/data shows bench history
4. Select "Back Squat" tab
5. Verify graph/data shows squat history
6. Select "Deadlift (Conventional)" tab
7. Verify graph/data shows deadlift history

**Expected Result:**
- Graph updates to show selected lift's baseline curve
- Points show tested 1RMs for selected lift only
- Stats update accordingly per lift
- No cross-lift data mixing

**Verification:**
- [ ] Bench filter shows only bench data
- [ ] Squat filter shows only squat data
- [ ] Deadlift filter shows only deadlift data
- [ ] Stats are per-lift (current 1RM, best 1RM, progress)
- [ ] No cross-lift contamination

---

### ✅ Test 8: Data Persistence
**Goal:** Verify data persists with correct liftType after app restart.

**Steps:**
1. Log sets for all three lifts (bench, squat, deadlift)
2. Add tested 1RMs for at least two lifts
3. Force close the app completely
4. Restart the app
5. Navigate to Dashboard

**Expected Result:**
- All data persists correctly
- Each lift shows its own data
- liftType is preserved for all sets and tested 1RMs
- No data loss or corruption

**Verification:**
- [ ] Bench data persists after restart
- [ ] Squat data persists after restart
- [ ] Deadlift data persists after restart
- [ ] Tested 1RMs persist with correct liftType
- [ ] No data mixing or corruption

---

### ✅ Test 9: Debug Helper Verification
**Goal:** Verify debug helpers show correct counts per lift.

**Steps:**
1. Open browser console (F12 or DevTools)
2. Run: `window.debugHelpers.logStorageState()`
3. Verify output shows correct counts
4. Run: `window.debugHelpers.logLiftCounts('bench')`
5. Verify bench-specific data
6. Run: `window.debugHelpers.logLiftCounts('squat')`
7. Verify squat-specific data

**Expected Result:**
- Total sets and breakdown per lift are correct
- Tested 1RMs breakdown per lift is correct
- Migration status is shown
- Per-lift counts match actual data

**Verification:**
- [ ] Total sets count matches logged sets
- [ ] Bench count matches bench sets only
- [ ] Squat count matches squat sets only
- [ ] Deadlift count matches deadlift sets only
- [ ] Tested 1RM counts are correct per lift
- [ ] No sets without liftType (should be 0)

---

## Test Completion

After completing all tests:

- [ ] All 9 tests passed
- [ ] No cross-lift contamination observed
- [ ] Data persists correctly
- [ ] UI displays correctly for all lifts
- [ ] Debug helpers work as expected

## Notes

- If any test fails, document the issue and expected vs actual behavior
- Take screenshots of any issues
- Report bugs with steps to reproduce

---

**Last Updated:** Beta 2.0
**Test Plan Version:** 1.0

