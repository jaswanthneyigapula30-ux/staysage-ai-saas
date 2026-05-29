// StaySage AI - AI Heuristics Verification Script
// Run: node scripts/test-ai-heuristics.js

import { analyzeComplaintHeuristically } from '../src/lib/ai.ts';

const testCases = [
  {
    text: "Room 302 AC not working and guest is angry because issue was reported twice.",
    expectedCategory: "Maintenance",
    expectedPriority: "High",
    expectedRoom: "302"
  },
  {
    text: "The sheets on the bed in Rm 115 are dirty. Please send clean ones.",
    expectedCategory: "Housekeeping",
    expectedPriority: "Low",
    expectedRoom: "115"
  },
  {
    text: "I was double charged on my receipt for breakfast, please refund me immediately.",
    expectedCategory: "Billing",
    expectedPriority: "High",
    expectedRoom: ""
  },
  {
    text: "LOUD PARTY in Room 504 is making it impossible to sleep! EMERGENCY!",
    expectedCategory: "Noise",
    expectedPriority: "Critical",
    expectedRoom: "504"
  },
  {
    text: "A clerk at the front desk was very rude to us when we checked in.",
    expectedCategory: "Staff Behavior",
    expectedPriority: "Medium",
    expectedRoom: ""
  },
  {
    text: "Guest slipped on wet tiles near the pool and might have hurt his ankle. Send help.",
    expectedCategory: "Safety",
    expectedPriority: "High",
    expectedRoom: ""
  }
];

function runTests() {
  console.log("====================================================");
  console.log("RUNNING STAYSAGE AI HEURISTIC CLASSIFIER VERIFICATION");
  console.log("====================================================\n");
  
  let passed = 0;
  
  testCases.forEach((tc, idx) => {
    try {
      const result = analyzeComplaintHeuristically(tc.text);
      
      const catMatch = result.category === tc.expectedCategory;
      const prioMatch = result.priority === tc.expectedPriority;
      const roomMatch = result.room_number === tc.expectedRoom;
      
      const casePassed = catMatch && prioMatch && roomMatch;
      
      console.log(`Test Case #${idx + 1}: "${tc.text.substring(0, 50)}..."`);
      console.log(`  - Category:  ${result.category} (Expected: ${tc.expectedCategory}) [${catMatch ? 'PASS' : 'FAIL'}]`);
      console.log(`  - Priority:  ${result.priority} (Expected: ${tc.expectedPriority}) [${prioMatch ? 'PASS' : 'FAIL'}]`);
      console.log(`  - Room:      ${result.room_number || 'N/A'} (Expected: ${tc.expectedRoom || 'N/A'}) [${roomMatch ? 'PASS' : 'FAIL'}]`);
      console.log(`  - Action:    ${result.suggested_action}`);
      console.log(`  - Escalated: ${result.escalation_required}`);
      console.log(`  - RESULT:    ${casePassed ? 'SUCCESS' : 'FAILED'}\n`);
      
      if (casePassed) passed++;
    } catch (e) {
      console.error(`  - Test Case #${idx + 1} threw error:`, e.message);
    }
  });

  console.log("====================================================");
  console.log(`VERIFICATION SUMMARY: ${passed}/${testCases.length} TESTS PASSED`);
  console.log("====================================================");
  
  if (passed === testCases.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
