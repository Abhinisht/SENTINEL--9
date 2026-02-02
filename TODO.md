# Task: Fix Security Lockdown Persistence Across Browser Reloads

## Plan
1. **Persist lockout state in localStorage** in `src/hooks/useAegisState.ts`:
   - Save `isLocked` and `lockoutEndTime` to localStorage when lockout is activated
   - Load persisted lockout state on hook initialization
   - Clear persisted lockout state when lockout expires or is manually unlocked

2. **Check for expired lockouts on initialization**:
   - On hook mount, check if there's a persisted lockout
   - If lockout end time has passed, clear the persisted state and don't activate lockout
   - If lockout is still active, restore the lockout state

3. **Update LockoutOverlay to handle expired lockouts**:
   - Ensure the overlay properly hides when lockout expires
   - Add logic to clear persisted state when lockout naturally expires

## Files to Edit
- `src/hooks/useAegisState.ts`: Add localStorage persistence for lockout state
- `src/components/aegis/LockoutOverlay.tsx`: Ensure proper handling of expired lockouts

## Next Steps
- Implement localStorage persistence in useAegisState
- Add initialization check for expired lockouts
- Test lockout persistence across browser reloads
- Verify auto-unlock works correctly after reload
