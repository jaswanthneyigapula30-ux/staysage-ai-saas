import OpenAI from 'openai';

export interface AIAnalysisResult {
  summary: string;
  category: 'Maintenance' | 'Housekeeping' | 'Billing' | 'Noise' | 'Staff Behavior' | 'Amenities' | 'Food Service' | 'Safety';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  sentiment: string;
  room_number: string;
  suggested_department: 'Maintenance' | 'Housekeeping' | 'Billing' | 'Noise' | 'Staff Behavior' | 'Amenities' | 'Food Service' | 'Safety';
  escalation_required: boolean;
  suggested_action: string;
  short_internal_note: string;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Initialize OpenAI client if key exists
let openai: OpenAI | null = null;
if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}

// Rule-based heuristic analyzer as fallback
export function analyzeComplaintHeuristically(text: string): AIAnalysisResult {
  const normalized = text.toLowerCase();
  
  // 1. Extract Room Number
  let roomNumber = '';
  const roomRegex = /\b(?:room|rm|suite|unit)?\s*(\d{2,4})\b/i;
  const match = text.match(roomRegex);
  if (match) {
    roomNumber = match[1];
  }

  // 2. Determine Category and Department
  let category: AIAnalysisResult['category'] = 'Maintenance';
  let priority: AIAnalysisResult['priority'] = 'Medium';
  let sentiment = 'Neutral';
  let suggestedAction = '';
  let shortInternalNote = '';

  // Housekeeping keywords
  if (
    normalized.includes('dirty') || 
    normalized.includes('towel') || 
    normalized.includes('bed') || 
    normalized.includes('sheets') || 
    normalized.includes('clean') || 
    normalized.includes('trash') || 
    normalized.includes('dust') ||
    normalized.includes('toilet paper') ||
    normalized.includes('soap') ||
    normalized.includes('shampoo')
  ) {
    category = 'Housekeeping';
    suggestedAction = 'Send housekeeping team to deliver replacement items or clean the requested area immediately.';
    shortInternalNote = 'Housekeeping service requested.';
    sentiment = 'Dissatisfied';
  }
  // Billing keywords
  else if (
    normalized.includes('bill') || 
    normalized.includes('charge') || 
    normalized.includes('double') || 
    normalized.includes('refund') || 
    normalized.includes('receipt') || 
    normalized.includes('overcharge') || 
    normalized.includes('price') ||
    normalized.includes('cost') ||
    normalized.includes('checkout')
  ) {
    category = 'Billing';
    suggestedAction = 'Check the Property Management System (PMS) for charge discrepancies. Review account details and issue refund if billing error is verified.';
    shortInternalNote = 'Billing inquiry / dispute.';
    sentiment = 'Frustrated';
  }
  // Noise keywords
  else if (
    normalized.includes('noise') || 
    normalized.includes('loud') || 
    normalized.includes('party') || 
    normalized.includes('music') || 
    normalized.includes('bark') || 
    normalized.includes('quiet') ||
    normalized.includes('neighbor') ||
    normalized.includes('scream')
  ) {
    category = 'Noise';
    suggestedAction = 'Send night supervisor or security team to investigate the source of the noise. Issue warning to offending room.';
    shortInternalNote = 'Noise disturbance reported.';
    sentiment = 'Annoyed / Disturbed';
  }
  // Staff behavior
  else if (
    normalized.includes('rude') || 
    normalized.includes('attitude') || 
    normalized.includes('unhelpful') || 
    normalized.includes('ignored') || 
    normalized.includes('staff') ||
    normalized.includes('clerk') ||
    normalized.includes('receptionist')
  ) {
    category = 'Staff Behavior';
    suggestedAction = 'Have a duty manager call or meet with the guest to resolve the conflict. Internal review of staff shift roster scheduled.';
    shortInternalNote = 'Service/Staff complaint.';
    sentiment = 'Offended / Angry';
  }
  // Food service
  else if (
    normalized.includes('food') || 
    normalized.includes('breakfast') || 
    normalized.includes('dinner') || 
    normalized.includes('lunch') || 
    normalized.includes('meal') || 
    normalized.includes('restaurant') ||
    normalized.includes('cold') ||
    normalized.includes('raw') ||
    normalized.includes('room service')
  ) {
    category = 'Food Service';
    suggestedAction = 'Contact F&B / kitchen manager. Replace the meal or remove the F&B charge from guest folio as a gesture of goodwill.';
    shortInternalNote = 'F&B quality / delivery issue.';
    sentiment = 'Dissatisfied';
  }
  // Safety
  else if (
    normalized.includes('safe') || 
    normalized.includes('danger') || 
    normalized.includes('security') || 
    normalized.includes('fire') || 
    normalized.includes('smoke') || 
    normalized.includes('lock') ||
    normalized.includes('stolen') ||
    normalized.includes('theft') ||
    normalized.includes('slip') ||
    normalized.includes('fall')
  ) {
    category = 'Safety';
    suggestedAction = 'Dispatch security officer to inspect immediately. Assess hazard, tape off area if necessary, and file safety report.';
    shortInternalNote = 'Safety / Security concern.';
    sentiment = 'Alarmed / Anxious';
    priority = 'High';
  }
  // Amenities
  else if (
    normalized.includes('wifi') || 
    normalized.includes('internet') || 
    normalized.includes('pool') || 
    normalized.includes('gym') || 
    normalized.includes('elevator') || 
    normalized.includes('parking') ||
    normalized.includes('keycard') ||
    normalized.includes('tv')
  ) {
    category = 'Amenities';
    suggestedAction = 'Check IT network / amenity status. Reset router or issue replacement keycard. Inform guest once resolved.';
    shortInternalNote = 'Amenity / Tech issue.';
    sentiment = 'Disappointed';
  }
  // Maintenance (Default)
  else {
    category = 'Maintenance';
    suggestedAction = 'Assign maintenance technician to inspect and repair the reported malfunction.';
    shortInternalNote = 'General maintenance request.';
    sentiment = 'Neutral';
  }

  // 3. Heuristic Priority Logic
  if (
    normalized.includes('emergency') || 
    normalized.includes('fire') || 
    normalized.includes('water leak') || 
    normalized.includes('flooding') || 
    normalized.includes('broken glass') ||
    normalized.includes('blood') ||
    normalized.includes('hurt') ||
    normalized.includes('police')
  ) {
    priority = 'Critical';
  } else if (
    normalized.includes('angry') || 
    normalized.includes('refund') || 
    normalized.includes('sue') || 
    normalized.includes('twice') || 
    normalized.includes('worst') ||
    normalized.includes('unacceptable') ||
    normalized.includes('disaster') ||
    normalized.includes('furious')
  ) {
    priority = 'High';
  } else if (
    normalized.includes('please') || 
    normalized.includes('mild') || 
    normalized.includes('could you') || 
    normalized.includes('suggest') ||
    normalized.includes('just letting you know')
  ) {
    priority = 'Low';
  }

  // 4. Escalation
  const escalationRequired = priority === 'High' || priority === 'Critical' || normalized.includes('manager') || normalized.includes('twice');

  // Summary generation
  let summary = text;
  if (text.length > 80) {
    summary = text.substring(0, 77) + '...';
  }

  return {
    summary,
    category,
    priority,
    sentiment,
    room_number: roomNumber,
    suggested_department: category,
    escalation_required: escalationRequired,
    suggested_action: suggestedAction,
    short_internal_note: shortInternalNote || 'Processed by StaySage AI Classifier.'
  };
}

export async function analyzeComplaint(text: string): Promise<AIAnalysisResult> {
  if (!openai) {
    console.log('OpenAI API key not configured. Using rule-based fallback heuristics.');
    return analyzeComplaintHeuristically(text);
  }

  try {
    const prompt = `You are a professional guest operations AI for a luxury hotel. Analyze this guest complaint and return a structured JSON response.

Complaint text: "${text}"

You MUST respond with a valid JSON object matching this schema, and nothing else (no markdown formatting, no codeblocks):
{
  "summary": "Brief one-sentence summary of the core complaint",
  "category": "One of: Maintenance, Housekeeping, Billing, Noise, Staff Behavior, Amenities, Food Service, Safety",
  "priority": "One of: Low, Medium, High, Critical",
  "sentiment": "One of: Angry, Frustrated, Disappointed, Neutral, Concerned",
  "room_number": "String representing the room number if mentioned (e.g. '302'), or empty string '' if not",
  "suggested_department": "One of: Maintenance, Housekeeping, Billing, Noise, Staff Behavior, Amenities, Food Service, Safety",
  "escalation_required": true/false (true if priority is High or Critical, or if guest mentions complaining multiple times or asking for managers/refunds),
  "suggested_action": "Specific, actionable operations procedure for staff to resolve this issue",
  "short_internal_note": "A short, professional internal note for the front desk staff log"
}

Validate that:
- suggested_department matches one of the allowed categories.
- priority matches one of: Low, Medium, High, Critical.
- JSON parses cleanly.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const responseText = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(responseText) as AIAnalysisResult;

    // Validate structured response
    const validCategories = ['Maintenance', 'Housekeeping', 'Billing', 'Noise', 'Staff Behavior', 'Amenities', 'Food Service', 'Safety'];
    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];

    if (!validCategories.includes(result.category)) {
      result.category = 'Maintenance';
    }
    if (!validPriorities.includes(result.priority)) {
      result.priority = 'Medium';
    }
    if (!validCategories.includes(result.suggested_department)) {
      result.suggested_department = result.category;
    }
    if (typeof result.escalation_required !== 'boolean') {
      result.escalation_required = result.priority === 'High' || result.priority === 'Critical';
    }

    return result;
  } catch (err) {
    console.error('OpenAI analysis failed, falling back to heuristics. Error:', err);
    return analyzeComplaintHeuristically(text);
  }
}
