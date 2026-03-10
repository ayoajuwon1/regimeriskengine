export const REVIEW_READY_STATUSES = ["Validated", "Escalated"];
export const COMMITTEE_MEMO_STATUSES = ["Ready for Committee", "Sent to Committee"];

export function validateReviewDecision(reviewDraft) {
  if (reviewDraft?.escalationOverride && !reviewDraft?.escalationOverrideReason?.trim()) {
    return "Add an override reason before saving an escalation override.";
  }

  return null;
}

export function validateMemoStatusChange(memoDraft, reviewDraft) {
  if (
    COMMITTEE_MEMO_STATUSES.includes(memoDraft?.status) &&
    !REVIEW_READY_STATUSES.includes(reviewDraft?.status)
  ) {
    return "Set the review status to Validated or Escalated before marking the memo ready for committee use.";
  }

  return null;
}
