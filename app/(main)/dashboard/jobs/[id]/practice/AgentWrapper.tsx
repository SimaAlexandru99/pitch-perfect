"use client";

import Agent from "./Agent";

interface AgentWrapperProps {
  userName: string;
  userId: string;
  jobId: string;
  type: "generate" | "practice";
  jobTitle: string;
  jobDomain: string;
  jobLevel: string;
  feedbackId?: string;
}

const AgentWrapper = (props: AgentWrapperProps) => {
  return (
    <>
      <Agent {...props} />
    </>
  );
};

export default AgentWrapper;
