export type FreelancerDecision = "ACCEPTED" | "DECLINED" | "IN_PROGRESS" | "SUBMITTED";

const transitions: Record<FreelancerDecision, string[]> = {
  ACCEPTED: ["NEW"],
  DECLINED: ["NEW"],
  IN_PROGRESS: ["ACCEPTED"],
  SUBMITTED: ["IN_PROGRESS"],
};

export function canFreelancerTransition(current: string | null, next: FreelancerDecision) {
  return Object.hasOwn(transitions, next) && transitions[next].includes(current ?? "NEW");
}
