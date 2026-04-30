import type { EvaluationResult } from "@/lib/types";
import { prisma } from "@/lib/db";

const KEYWORDS = [
  "llm",
  "agent",
  "python",
  "typescript",
  "production",
  "leadership",
  "experimentation",
  "platform",
  "evaluation",
];

function clamp(value: number) {
  return Math.max(1, Math.min(5, value));
}

export function evaluateJobDescription(jdText: string): EvaluationResult {
  const lower = jdText.toLowerCase();
  const matchHits = KEYWORDS.filter((keyword) => lower.includes(keyword)).length;

  const match = clamp(2 + matchHits * 0.35);
  const growth = clamp(2.2 + (lower.includes("senior") ? 1.3 : 0.7));
  const comp = clamp(2.5 + (lower.includes("$") || lower.includes("salary") ? 1.4 : 0.6));
  const risk = clamp(3.5 - (lower.includes("onsite") ? 1.2 : 0.2));
  const narrative = clamp(2 + (lower.includes("impact") ? 1.8 : 1));

  const overall = clamp((match * 0.35 + growth * 0.2 + comp * 0.15 + risk * 0.15 + narrative * 0.15));
  const recommendation = overall >= 4 ? "apply" : overall >= 3 ? "consider" : "skip";
  const confidence = clamp(2 + Math.min(3, jdText.length / 1200));

  const gaps = [
    "Missing explicit leadership signals in CV evidence",
    "No quantified production metrics highlighted",
    "Compensation range requires recruiter confirmation",
  ].slice(0, overall >= 4 ? 1 : overall >= 3 ? 2 : 3);

  return {
    score: { match, growth, comp, risk, narrative, overall },
    recommendation,
    confidence,
    summary: `Role scored ${overall.toFixed(1)}/5 with a ${recommendation.toUpperCase()} recommendation.`,
    gaps,
    strengths: [
      "Role scope aligns with modern AI product delivery",
      "Technical expectations are feasible for an AI-focused profile",
      "Cross-functional collaboration is explicitly valued",
    ].slice(0, overall >= 4 ? 3 : 2),
    nextActions: [
      "Tailor CV summary with two role-specific impact bullets",
      "Prepare one STAR story for production AI delivery",
      "Confirm compensation band with recruiter early",
    ],
    cvTailoring: [
      "Include measurable production outcomes in the first experience block",
      "Mirror JD keywords in skills and project descriptions",
      "Highlight stack overlap (Python, LLM tooling, experimentation)",
    ],
    interviewFocus: [
      "System design for AI/LLM production deployments",
      "Trade-offs between model quality, latency, and cost",
      "Stakeholder alignment on ambiguous product requirements",
    ],
    modelUsed: "heuristic-fallback-v1",
    agentErrorCode: "FALLBACK_ONLY",
  };
}

type AgenticPayload = {
  company: string;
  role: string;
  jdText: string;
};

function parseJsonObject(raw: string): unknown {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(raw.slice(start, end + 1));
  }
  return JSON.parse(raw);
}

function extractOutputText(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as {
    output_text?: string;
    output?: Array<{
      content?: Array<{ type?: string; text?: string }>;
    }>;
  };

  if (record.output_text && typeof record.output_text === "string") {
    return record.output_text;
  }

  const chunks =
    record.output
      ?.flatMap((message) => message.content ?? [])
      .filter((part) => part.type === "output_text" && typeof part.text === "string")
      .map((part) => part.text as string) ?? [];

  if (chunks.length === 0) return null;
  return chunks.join("\n");
}

export async function evaluateWithAgenticFlow(
  payload: AgenticPayload,
  context?: { workspaceId?: string; userId?: string },
): Promise<EvaluationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    return {
      ...evaluateJobDescription(payload.jdText),
      agentErrorCode: "MISSING_OPENAI_API_KEY",
    };
  }

  const prompt = `
You are an expert career decision agent.
Analyze the following job and return ONLY valid JSON with fields:
score: {match,growth,comp,risk,narrative,overall} each 1-5 numbers,
recommendation: one of apply|consider|skip,
confidence: 1-5 number,
summary: string,
gaps: string[],
strengths: string[],
nextActions: string[],
cvTailoring: string[],
interviewFocus: string[].

Company: ${payload.company}
Role: ${payload.role}
JD:
${payload.jdText}
`;

  try {
    const startedAt = Date.now();
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: prompt,
      }),
    });

    if (!response.ok) {
      return {
        ...evaluateJobDescription(payload.jdText),
        agentErrorCode: `OPENAI_HTTP_${response.status}`,
      };
    }

    const data = await response.json();
    const outputText = extractOutputText(data);
    if (!outputText) {
      return {
        ...evaluateJobDescription(payload.jdText),
        agentErrorCode: "OPENAI_EMPTY_OUTPUT",
      };
    }

    const parsed = parseJsonObject(outputText) as Omit<EvaluationResult, "modelUsed">;
    const elapsed = Date.now() - startedAt;
    const usage = (data as { usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number } }).usage;
    const inputTokens = usage?.input_tokens ?? 0;
    const outputTokens = usage?.output_tokens ?? 0;
    const totalTokens = usage?.total_tokens ?? inputTokens + outputTokens;
    const cost = totalTokens * 0.0000005;

    if (context?.userId) {
      await prisma.promptRun.create({
        data: {
          userId: context.userId,
          mode: "evaluation",
          model,
          promptVersion: "v2-agentic",
          latencyMs: elapsed,
          inputTokens,
          outputTokens,
          costUsd: cost,
        },
      });
    }

    return {
      ...parsed,
      modelUsed: model,
      agentErrorCode: undefined,
    };
  } catch {
    return {
      ...evaluateJobDescription(payload.jdText),
      agentErrorCode: "OPENAI_RUNTIME_ERROR",
    };
  }
}
