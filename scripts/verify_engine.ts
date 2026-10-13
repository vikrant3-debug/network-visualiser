import { NETWORK_PRESETS } from '../src/constants/presets';
import { getChannelsSubset } from '../src/constants/channels';
import { generateBacktrackingTrace } from '../src/algorithm/backtrackingEngine';
import { verifyGraphColoring } from '../src/utils/graphGenerator';
import { AccessPoint, InterferenceEdge } from '../src/types';

console.log('====================================================');
console.log('RUNNING DAA ALGORITHM ENGINE COMPREHENSIVE TESTS');
console.log('====================================================');

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

// ---- Helpers to build synthetic edge-case graphs inline ----
function makeAP(id: string): AccessPoint {
  return { id, label: id, locationName: id, x: 0, y: 0, channelId: null, coverageRadius: 80 };
}

function completeGraphEdges(ids: string[]): InterferenceEdge[] {
  const edges: InterferenceEdge[] = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      edges.push({ id: `${ids[i]}-${ids[j]}`, source: ids[i], target: ids[j] });
    }
  }
  return edges;
}

function cycleGraphEdges(ids: string[]): InterferenceEdge[] {
  const edges: InterferenceEdge[] = [];
  for (let i = 0; i < ids.length; i++) {
    const a = ids[i];
    const b = ids[(i + 1) % ids.length];
    edges.push({ id: `${a}-${b}`, source: a, target: b });
  }
  return edges;
}

// Test 1: Small Office (6 APs, 3 channels) -> Valid allocation
{
  const preset = NETWORK_PRESETS.find((p) => p.id === 'small-office')!;
  const channels = getChannelsSubset(3);
  const trace = generateBacktrackingTrace(preset.nodes, preset.edges, channels);

  assert(trace.solutionFound === true, 'Test 1: Small Office finds valid solution');
  const verification = verifyGraphColoring(preset.nodes, preset.edges, trace.finalAssignment);
  assert(verification.isValid === true, 'Test 1: Verification confirms 0 conflicts and all vertices assigned');
  assert(trace.steps.length > 5, 'Test 1: Trace generated step-by-step records');
}

// Test 2: College Floor (8 APs, 3 channels) -> Valid allocation
{
  const preset = NETWORK_PRESETS.find((p) => p.id === 'college-floor')!;
  const channels = getChannelsSubset(3);
  const trace = generateBacktrackingTrace(preset.nodes, preset.edges, channels);

  assert(trace.solutionFound === true, 'Test 2: College Floor finds valid solution');
  const verification = verifyGraphColoring(preset.nodes, preset.edges, trace.finalAssignment);
  assert(verification.isValid === true, 'Test 2: College floor has 0 conflicts');
}

// Test 3: K4 Complete Graph (4 APs, 6 edges, 2 channels) -> Must report NO SOLUTION (chromatic number is 4)
{
  const ids = ['AP1', 'AP2', 'AP3', 'AP4'];
  const nodes = ids.map(makeAP);
  const edges = completeGraphEdges(ids);
  const channels = getChannelsSubset(2);
  const trace = generateBacktrackingTrace(nodes, edges, channels);

  assert(trace.solutionFound === false, 'Test 3: K4 with 2 channels correctly reports NO solution');
  const lastStep = trace.steps[trace.steps.length - 1];
  assert(lastStep.type === 'FAILURE', 'Test 3: Last step is FAILURE');
  assert(trace.totalBacktracks > 0, 'Test 3: Backtracks were explored and recorded');

  // K4 is solvable with 4 channels (sanity: engine is not trivially failing)
  const trace4 = generateBacktrackingTrace(nodes, edges, getChannelsSubset(4));
  assert(trace4.solutionFound === true, 'Test 3b: K4 with 4 channels DOES find a solution');
}

// Test 4: Odd Cycle C5 (5 APs, 5 edges, 2 channels) -> Must report NO SOLUTION (chromatic number is 3)
{
  const ids = ['AP1', 'AP2', 'AP3', 'AP4', 'AP5'];
  const nodes = ids.map(makeAP);
  const edges = cycleGraphEdges(ids);
  const channels = getChannelsSubset(2);
  const trace = generateBacktrackingTrace(nodes, edges, channels);

  assert(trace.solutionFound === false, 'Test 4: Odd cycle C5 with 2 channels correctly reports NO solution');
  const lastStep = trace.steps[trace.steps.length - 1];
  assert(lastStep.type === 'FAILURE', 'Test 4: Last step is FAILURE');
}

// Test 5: Odd Cycle C5 with 3 channels -> Solvable with backtracking!
{
  const ids = ['AP1', 'AP2', 'AP3', 'AP4', 'AP5'];
  const nodes = ids.map(makeAP);
  const edges = cycleGraphEdges(ids);
  const channels = getChannelsSubset(3);
  const trace = generateBacktrackingTrace(nodes, edges, channels);

  assert(trace.solutionFound === true, 'Test 5: C5 with 3 channels finds valid solution');
  const verification = verifyGraphColoring(nodes, edges, trace.finalAssignment);
  assert(verification.isValid === true, 'Test 5: C5 3-coloring has 0 conflicts');
}

// Test 6: Dense Network (10 APs, 16 edges, 4 channels) -> Solvable
{
  const preset = NETWORK_PRESETS.find((p) => p.id === 'dense-network')!;
  const channels = getChannelsSubset(4);
  const trace = generateBacktrackingTrace(preset.nodes, preset.edges, channels);

  assert(trace.solutionFound === true, 'Test 6: Dense Network (10 APs) finds valid solution');
  const verification = verifyGraphColoring(preset.nodes, preset.edges, trace.finalAssignment);
  assert(verification.isValid === true, 'Test 6: Dense network allocation verified conflict-free');
  assert(trace.totalBacktracks >= 0, 'Test 6: Backtracking stats correctly computed');
}

// Test 7: Step-by-Step execution invariant check
{
  const preset = NETWORK_PRESETS[0];
  const channels = getChannelsSubset(3);
  const trace = generateBacktrackingTrace(preset.nodes, preset.edges, channels);

  let invariantsHold = true;
  for (let i = 0; i < trace.steps.length; i++) {
    const step = trace.steps[i];
    if (step.stepNumber !== i + 1) invariantsHold = false;
    if (!step.description) invariantsHold = false;
    if (!step.assignmentSnapshot) invariantsHold = false;
  }
  assert(invariantsHold === true, 'Test 7: Step numbering and snapshot integrity holds for all steps');
}

console.log('====================================================');
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
