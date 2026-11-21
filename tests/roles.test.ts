import assert from "node:assert/strict";
import test from "node:test";

import { roleForEmails } from "../lib/roles.ts";
import { readinessQuestions, scoreDigitalReadiness } from "../lib/digital-readiness.ts";
import { canFreelancerTransition } from "../lib/freelancer-workflow.ts";

const env = {
  ADMIN_EMAILS: "admin@example.com",
};

test("member is the safe default role", () => {
  assert.equal(roleForEmails(["member@example.com"], undefined, env), "member");
});

test("freelancer metadata cannot elevate a member without database approval", () => {
  assert.equal(
    roleForEmails(["freelancer@example.com"], "freelancer", env),
    "member",
  );
});

test("admin access is granted only through the email allowlist", () => {
  assert.equal(roleForEmails(["ADMIN@example.com"], undefined, env), "admin");
  assert.equal(roleForEmails(["member@example.com"], "admin", env), "member");
});

test("digital readiness scoring returns bounded and actionable results", () => {
  const low = scoreDigitalReadiness(Object.fromEntries(readinessQuestions.map((item) => [item.id, 0])));
  const high = scoreDigitalReadiness(Object.fromEntries(readinessQuestions.map((item) => [item.id, 4])));
  assert.equal(low.totalScore, 0);
  assert.equal(low.level, "Fondasi");
  assert.equal(high.totalScore, 100);
  assert.equal(high.level, "Digital-Ready");
  assert.equal(high.recommendations.length, 3);
});

test("freelancer work follows a one-way request-to-delivery flow", () => {
  assert.equal(canFreelancerTransition("NEW", "ACCEPTED"), true);
  assert.equal(canFreelancerTransition("NEW", "DECLINED"), true);
  assert.equal(canFreelancerTransition("NEW", "SUBMITTED"), false);
  assert.equal(canFreelancerTransition("ACCEPTED", "IN_PROGRESS"), true);
  assert.equal(canFreelancerTransition("IN_PROGRESS", "SUBMITTED"), true);
  assert.equal(canFreelancerTransition("SUBMITTED", "ACCEPTED"), false);
});
