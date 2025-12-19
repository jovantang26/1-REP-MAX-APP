import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentBaselineOneRm, useUserProfile, useUnitSystem } from '../hooks';
import { testedOneRmRepository, testedPrAnchorRepository } from '../storage';
import type { LiftType, TestedPrAnchor } from '../domain';
import { LIFT_DISPLAY_NAMES, getProfileSex } from '../domain';
import { getStrengthCategoryForGender, getStrengthCategory } from '../estimation/strengthCategory';
import { calculateOneRmRatio } from '../domain';
import { formatWeight, getUnitLabel, getCategoryDescription } from '../utils';

/**
 * Home / Dashboard Screen (B2.3.2 - Multi-Lift Dashboard)
 * 
 * Displays 3 cards (one for each lift):
 * - Bench Card
 * - Squat Card
 * - Deadlift Card
 * 
 * Each card shows:
 * - Baseline 1RM ± uncertainty
 * - Strength category (e.g., "Intermediate")
 * - Ratio (e.g., "1.7× BW")
 * - Last tested date (if any)
 */
export function DashboardScreen() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { unitSystem } = useUnitSystem();
  
  // B3.5.1 - Load data for all four lifts (including powerclean)
  const benchResult = useCurrentBaselineOneRm('bench');
  const squatResult = useCurrentBaselineOneRm('squat');
  const deadliftResult = useCurrentBaselineOneRm('deadlift');
  const powercleanResult = useCurrentBaselineOneRm('powerclean');
  
  const [lastTested1Rms, setLastTested1Rms] = React.useState<Record<LiftType, { weight: number; date: Date } | null>>({
    bench: null,
    squat: null,
    deadlift: null,
    powerclean: null,
  });

  // B3.5.2 - Load PR anchors per lift
  const [prAnchors, setPrAnchors] = React.useState<Record<LiftType, TestedPrAnchor | null>>({
    bench: null,
    squat: null,
    deadlift: null,
    powerclean: null,
  });

  // Load last tested 1RM for each lift
  React.useEffect(() => {
    const loadLastTested = async () => {
      // B3.5.1 - Include powerclean in supported lifts
      const lifts: LiftType[] = ['bench', 'squat', 'deadlift', 'powerclean'];
      const results: Record<LiftType, { weight: number; date: Date } | null> = {
        bench: null,
        squat: null,
        deadlift: null,
        powerclean: null,
      };
      
      for (const liftType of lifts) {
        const tested = await testedOneRmRepository.getLatestTestedOneRmByLiftType(liftType);
        if (tested) {
          const timestamp = tested.timestamp instanceof Date 
            ? tested.timestamp 
            : new Date(tested.timestamp);
          results[liftType] = { weight: tested.weight, date: timestamp };
        }
      }
      
      setLastTested1Rms(results);
    };
    loadLastTested();
  }, []);

  // B3.5.2 - Load PR anchors
  React.useEffect(() => {
    const loadPrAnchors = async () => {
      const anchors = await testedPrAnchorRepository.getAllPrAnchors();
      setPrAnchors(anchors);
    };
    loadPrAnchors();
  }, []);

  if (!profile) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Dashboard</h1>
        <p style={{ color: '#dc3545' }}>
          No profile found. Please complete onboarding.
        </p>
        <button
          onClick={() => navigate('/onboarding')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px',
          }}
        >
          Go to Onboarding
        </button>
      </div>
    );
  }

  // Helper function to render a lift card
  // B3.5.2 - Updated to show both tested PR anchor and estimated 1RM
  const renderLiftCard = (
    liftType: LiftType,
    result: ReturnType<typeof useCurrentBaselineOneRm>,
    lastTested: { weight: number; date: Date } | null
  ) => {
    const prAnchor = prAnchors[liftType];
    const isLoading = result.loading;
    const hasError = result.error !== null;
    const hasResult = result.result !== null;

    // B2.5.3 - Dashboard Category Display Rules
    // Each lift card must show:
    // - Category label (e.g. "Intermediate")
    // - Ratio value (e.g. "1.55× BW")
    // - Optional microcopy: "Advanced for your bodyweight"
    let strengthCategoryLabel: string | null = null;
    let ratio: string | null = null;
    let ratioValue: number | null = null;
    
    if (hasResult && profile) {
      try {
        // B3.2.2 - Use getProfileSex helper and support "other"
        const sexValue = getProfileSex(profile);
        const gender = (sexValue === "male" || sexValue === "female" || sexValue === "other") 
          ? sexValue as "male" | "female" | "other"
          : "other"; // Default to "other" if unrecognized
        
        // Use universal getStrengthCategory function (B2.5.2, B3.2.2)
        const categoryLabel = getStrengthCategory(
          liftType,
          gender,
          result.result!.baselineOneRm,
          profile.bodyweight
        );
        
        // Capitalize first letter for display
        strengthCategoryLabel = categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1);
        
        // Calculate ratio for display
        ratioValue = calculateOneRmRatio(result.result!.baselineOneRm, profile.bodyweight);
        if (ratioValue !== null) {
          ratio = ratioValue.toFixed(2);
        }
      } catch (error) {
        console.error(`Failed to calculate strength category for ${liftType}:`, error);
      }
    }

    return (
      <div
        key={liftType}
        style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #ddd',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>
          {LIFT_DISPLAY_NAMES[liftType]}
        </h2>

        {isLoading && (
          <div style={{ color: '#666', fontStyle: 'italic' }}>Loading...</div>
        )}

        {hasError && (
          <div style={{ color: '#dc3545' }}>
            Error: {result.error?.message || 'Failed to load data'}
          </div>
        )}

        {!isLoading && !hasError && !hasResult && (
          <div style={{ color: '#666' }}>
            No data available. Log some sets to see your 1RM estimate.
          </div>
        )}

        {!isLoading && !hasError && hasResult && (
          <>
            {/* B3.5.2 - Show Best Tested 1RM (PR Anchor) */}
            {prAnchor ? (
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  Best Tested 1RM (PR)
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                  {formatWeight(prAnchor.bestTested1Rm, unitSystem, 1)} {getUnitLabel(unitSystem)}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                  Achieved: {new Date(prAnchor.dateAchieved).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                <div style={{ fontSize: '14px', color: '#999', fontStyle: 'italic' }}>
                  No tested PR yet. Log a tested 1RM to set your anchor.
                </div>
              </div>
            )}

            {/* B3.5.2 - Show Estimated 1RM ± uncertainty */}
            <div style={{ marginBottom: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                Estimated 1RM
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#007bff' }}>
                {formatWeight(result.result!.baselineOneRm, unitSystem, 1)} {getUnitLabel(unitSystem)}
              </div>
              
              {/* B3.1.3 - Format uncertainty range in selected units */}
              <div style={{ color: '#666', marginBottom: '8px', fontSize: '14px' }}>
                Uncertainty: {formatWeight(result.result!.uncertaintyRange.low, unitSystem, 1)} - {formatWeight(result.result!.uncertaintyRange.high, unitSystem, 1)} {getUnitLabel(unitSystem)}
              </div>
            </div>
            
            <div style={{ color: '#666', marginBottom: '8px', fontSize: '14px' }}>
              Confidence: {(result.result!.confidenceLevel * 100).toFixed(0)}%
            </div>

            {/* B2.5.3 - Category Display: Category label, ratio value, and microcopy */}
            {/* B3.4.2 - Strength Category Descriptions: Supportive microcopy */}
            {strengthCategoryLabel && ratio && (
              <div style={{ color: '#666', marginBottom: '8px', fontSize: '14px' }}>
                <div style={{ marginBottom: '4px' }}>
                  Strength: <strong>{strengthCategoryLabel}</strong> ({ratio}× BW)
                </div>
                <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', marginTop: '4px' }}>
                  {getCategoryDescription(strengthCategoryLabel.toLowerCase())}
                </div>
              </div>
            )}

            {/* B3.1.3 - Format tested 1RM in selected units */}
            {lastTested && (
              <div style={{ color: '#666', fontSize: '14px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                Last Tested: <strong>{formatWeight(lastTested.weight, unitSystem, 1)} {getUnitLabel(unitSystem)}</strong>
                <br />
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {lastTested.date.toLocaleDateString()}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Dashboard</h1>
      
      {/* B2.3.2: Vertically stacked cards for each lift */}
      {/* B3.5.1 - Include powerclean card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {renderLiftCard('bench', benchResult, lastTested1Rms.bench)}
        {renderLiftCard('squat', squatResult, lastTested1Rms.squat)}
        {renderLiftCard('deadlift', deadliftResult, lastTested1Rms.deadlift)}
        {renderLiftCard('powerclean', powercleanResult, lastTested1Rms.powerclean)}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
        <button
          onClick={() => navigate('/log-session')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Log Training Session
        </button>
        
        <button
          onClick={() => navigate('/history')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          View History
        </button>
      </div>
    </div>
  );
}

