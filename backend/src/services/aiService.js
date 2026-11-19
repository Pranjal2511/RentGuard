import { env } from '../config/env.js';

export async function compareInspectionPhotos({ moveInPhoto, moveOutPhoto, room, component, moveInNotes, moveOutNotes }) {
  try {
    const response = await fetch(`${env.aiServiceUrl}/api/ai/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-Secret': env.aiServiceSecret,
      },
      body: JSON.stringify({
        moveInPhoto,
        moveOutPhoto,
        room,
        component,
        moveInNotes,
        moveOutNotes,
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error(`AI service responded with HTTP ${response.status}`);
  } catch {
    // Graceful fallback per Part 15.5: AI Failure Handling
    return {
      isAvailable: false,
      requiresHumanReview: true,
      message: 'AI comparison service is currently unavailable or optional. Manual visual inspection enabled.',
      delta: 'human_review_required',
      observations: [
        'Automated vision analysis bypassed. Please inspect move-in and move-out photos manually.',
      ],
    };
  }
}

export async function generateInspectionSummary(reportData) {
  try {
    const response = await fetch(`${env.aiServiceUrl}/api/ai/summarize-inspection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-Secret': env.aiServiceSecret,
      },
      body: JSON.stringify(reportData),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback
  }

  return {
    isAvailable: false,
    summary: 'Inspection completed with room-level photo evidence recorded. All items preserved for mutual confirmation.',
  };
}

