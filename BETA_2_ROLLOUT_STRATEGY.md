# B2.6.4 - Beta 2 Rollout Strategy

This document outlines the rollout strategy for Beta 2.0 multi-lift upgrade.

---

## Version Information

**Version:** Beta 2.0  
**Release Date:** [To be filled]  
**Previous Version:** Beta 1.0 (bench-only)

---

## What's New in Beta 2.0

### Major Features

1. **Multi-Lift Support**
   - Added support for Bench Press, Back Squat, and Deadlift
   - Each lift tracked independently
   - Per-lift baseline 1RM estimates
   - Per-lift strength categories

2. **Enhanced Dashboard**
   - Three separate cards (one per lift)
   - Independent strength categories per lift
   - Per-lift ratio display (e.g., "1.55× BW")

3. **Improved Logging**
   - Lift selector on logging screen
   - Filter sets by lift type
   - Support for mixed sessions

4. **History Filtering**
   - Filter history by lift type
   - Per-lift 90-day graphs
   - Per-lift statistics

---

## User Notification

### Message to Early Users

> **Beta 2.0 Update: Multi-Lift Support**
> 
> Your data has been upgraded to support multiple lifts! All your previous bench press logs have been preserved and are now part of the new multi-lift system.
> 
> **What Changed:**
> - Your existing bench press data is safe and unchanged
> - You can now log Squat and Deadlift sessions
> - Each lift has its own strength category and baseline estimate
> 
> **What to Try:**
> - Log a squat or deadlift session
> - Check out the new dashboard with three lift cards
> - Use the history filter to view each lift separately
> 
> **Note:** Strength categories may have shifted slightly due to per-lift calibration. This is expected and improves accuracy.

---

## Data Migration

### Automatic Migration

Beta 2.0 includes automatic data migration that:

1. **Preserves All Data**
   - All existing bench press sets are preserved
   - All tested 1RMs are preserved
   - No data loss during upgrade

2. **Assigns liftType**
   - All existing sets are assigned `liftType = "bench"`
   - All existing tested 1RMs are assigned `liftType = "bench"`
   - Migration runs automatically on first launch

3. **Field Updates**
   - `performedAt` → `timestamp` (for sets)
   - `testedAt` → `timestamp` (for tested 1RMs)
   - All data remains fully functional

### Migration Safety

- **Idempotent:** Safe to run multiple times
- **Non-destructive:** Never deletes data
- **Validated:** All migrated data is validated before saving
- **Reversible:** Original data structure preserved in comments

---

## User Guidance

### For Existing Users

1. **Your Data is Safe**
   - All bench press logs are preserved
   - All tested 1RMs are preserved
   - No action required

2. **Try New Features**
   - Log a squat or deadlift session
   - Explore the new dashboard layout
   - Use history filters

3. **Strength Categories**
   - Categories may have shifted due to per-lift thresholds
   - This is expected and improves accuracy
   - Each lift now has its own category

### For New Users

1. **Complete Onboarding**
   - Set up your profile
   - Optionally add a tested 1RM for any lift

2. **Start Logging**
   - Log sessions for any lift (bench, squat, deadlift)
   - Each lift is tracked independently

3. **Explore Dashboard**
   - View baseline estimates for each lift
   - Check strength categories per lift
   - Monitor progress independently

---

## Known Issues & Limitations

### Beta 2.0 Limitations

1. **No Combined View**
   - History shows one lift at a time
   - No "all lifts" combined graph (planned for Beta 3)

2. **Fixed Thresholds**
   - Strength category thresholds are fixed
   - No dynamic thresholds based on training experience (planned for Beta 3)

3. **No Overall Score**
   - No combined strength score across all lifts (planned for Beta 3)
   - No Wilks/DOTS scoring (planned for Beta 3)

### Known Issues

- None at this time

---

## Testing Recommendations

### For Test Users

1. **Test All Lifts**
   - Log sessions for bench, squat, and deadlift
   - Verify data appears correctly for each lift

2. **Test Mixed Sessions**
   - Log bench and squat in the same day
   - Verify proper separation

3. **Test Data Persistence**
   - Close and reopen the app
   - Verify data persists correctly

4. **Test History Filtering**
   - Switch between lift filters
   - Verify graphs update correctly

5. **Report Issues**
   - Document any bugs or unexpected behavior
   - Include steps to reproduce
   - Note which lift(s) are affected

---

## Rollout Phases

### Phase 1: Internal Testing
- [ ] Complete manual test plan (B2.6.3)
- [ ] Verify all tests pass
- [ ] Fix any critical issues

### Phase 2: Early User Testing
- [ ] Notify early users of update
- [ ] Monitor for issues
- [ ] Collect feedback

### Phase 3: General Release
- [ ] Address feedback from Phase 2
- [ ] Release to all users
- [ ] Monitor adoption and usage

---

## Support & Feedback

### Reporting Issues

If you encounter any issues:

1. Document the problem
2. Note which lift(s) are affected
3. Include steps to reproduce
4. Report via [support channel]

### Providing Feedback

We welcome feedback on:

- New features
- UI/UX improvements
- Feature requests
- Bug reports

---

## Future Roadmap

### Planned for Beta 3

1. **Overall Strength Score**
   - Combined score across all lifts
   - Weighted average calculation

2. **Wilks / DOTS Scoring**
   - Powerlifting coefficient formulas
   - Cross-bodyweight comparison

3. **Dynamic Thresholds**
   - Training experience-based adjustments
   - Personalized category thresholds

4. **Enhanced Visualizations**
   - Combined lift graphs
   - Progress tracking across lifts
   - Milestone celebrations

---

## Version History

- **Beta 2.0** - Multi-lift support, per-lift categories, enhanced dashboard
- **Beta 1.0** - Initial release (bench-only)

---

**Last Updated:** Beta 2.0  
**Document Version:** 1.0

