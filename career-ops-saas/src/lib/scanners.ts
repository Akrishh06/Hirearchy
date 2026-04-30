import type { JobCandidate } from "@/lib/types";

type Scanner = {
  source: JobCandidate["source"];
  scan: (query: string) => Promise<JobCandidate[]>;
};

const greenhouseScanner: Scanner = {
  source: "greenhouse",
  async scan(query) {
    return [
      {
        source: "greenhouse",
        company: "Anthropic",
        role: `${query} Engineer`,
        location: "Remote",
        url: "https://boards.greenhouse.io/example-role",
      },
    ];
  },
};

const ashbyScanner: Scanner = {
  source: "ashby",
  async scan(query) {
    return [
      {
        source: "ashby",
        company: "Retool",
        role: `Senior ${query}`,
        location: "San Francisco, CA",
        url: "https://jobs.ashbyhq.com/example-role",
      },
    ];
  },
};

const leverScanner: Scanner = {
  source: "lever",
  async scan(query) {
    return [
      {
        source: "lever",
        company: "LangChain",
        role: `${query} Platform Lead`,
        location: "New York, NY",
        url: "https://jobs.lever.co/example-role",
      },
    ];
  },
};

const scanners = [greenhouseScanner, ashbyScanner, leverScanner];

export async function scanPortals(query: string) {
  const results = await Promise.all(scanners.map((scanner) => scanner.scan(query)));
  return results.flat();
}
