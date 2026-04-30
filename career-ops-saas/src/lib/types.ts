export type ScoreBreakdown = {
  match: number;
  growth: number;
  comp: number;
  risk: number;
  narrative: number;
  overall: number;
};

export type EvaluationResult = {
  score: ScoreBreakdown;
  recommendation: "apply" | "consider" | "skip";
  confidence: number;
  summary: string;
  gaps: string[];
  strengths: string[];
  nextActions: string[];
  cvTailoring: string[];
  interviewFocus: string[];
  modelUsed: string;
  agentErrorCode?: string;
};

export type JobCandidate = {
  source: "greenhouse" | "ashby" | "lever";
  company: string;
  role: string;
  location: string;
  url: string;
};
