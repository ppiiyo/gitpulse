/**
 * Repository classification by stack / theme.
 * Overall ranking stays unfiltered; category boards slice the same scores.
 */

export type RepoCategoryId =
  | "all"
  | "ai"
  | "web"
  | "backend"
  | "devtools"
  | "systems"
  | "mobile"
  | "data"
  | "security"
  | "learning"
  | "other";

export interface RepoCategory {
  id: RepoCategoryId;
  label: string;
  description: string;
}

export const REPO_CATEGORIES: RepoCategory[] = [
  { id: "all", label: "All", description: "Full ranking across every tracked repo" },
  { id: "ai", label: "AI / LLM", description: "Models, agents, LLM tooling" },
  { id: "web", label: "Web / Frontend", description: "UI frameworks, CSS, browser" },
  { id: "backend", label: "Backend", description: "APIs, servers, databases" },
  { id: "devtools", label: "DevTools", description: "CLIs, editors, DX, build tools" },
  { id: "systems", label: "Systems", description: "OS, languages, low-level, runtimes" },
  { id: "mobile", label: "Mobile", description: "iOS, Android, cross-platform" },
  { id: "data", label: "Data / ML", description: "Pipelines, analytics, classical ML" },
  { id: "security", label: "Security", description: "Auth, crypto, vulnerability tooling" },
  { id: "learning", label: "Learning", description: "Tutorials, awesome lists, books" },
  { id: "other", label: "Other", description: "Unclassified in the current cohort" },
];

const TOPIC_MAP: Record<Exclude<RepoCategoryId, "all" | "other">, string[]> = {
  ai: [
    "ai", "llm", "gpt", "openai", "langchain", "agent", "agents",
    "machine-learning", "deep-learning", "transformers", "diffusion", "chatbot", "rag",
  ],
  web: [
    "react", "vue", "nextjs", "next", "frontend", "css", "tailwind", "ui", "web",
    "browser", "svelte", "angular", "remix",
  ],
  backend: [
    "api", "backend", "server", "database", "graphql", "rest", "microservice",
    "nodejs", "django", "fastapi", "spring",
  ],
  devtools: [
    "cli", "devtools", "developer-tools", "build-tool", "bundler", "linter",
    "formatter", "vscode", "ide", "dx", "testing",
  ],
  systems: [
    "operating-system", "kernel", "compiler", "rust", "c", "cpp", "systems",
    "runtime", "wasm", "embedded",
  ],
  mobile: ["android", "ios", "mobile", "react-native", "flutter", "swift", "kotlin"],
  data: [
    "data", "etl", "analytics", "pandas", "spark", "data-science",
    "visualization", "dataset",
  ],
  security: [
    "security", "crypto", "cryptography", "auth", "authentication",
    "vulnerability", "pentest", "privacy",
  ],
  learning: [
    "awesome", "awesome-list", "tutorial", "education", "learning",
    "books", "course", "interview", "algorithm", "algorithms",
  ],
};

const LANG_HINTS: Partial<Record<string, RepoCategoryId>> = {
  TypeScript: "web",
  JavaScript: "web",
  CSS: "web",
  HTML: "web",
  Vue: "web",
  Python: "data",
  Jupyter: "data",
  Go: "backend",
  Java: "backend",
  Ruby: "backend",
  PHP: "backend",
  Rust: "systems",
  C: "systems",
  "C++": "systems",
  Zig: "systems",
  Swift: "mobile",
  Kotlin: "mobile",
  Dart: "mobile",
  Shell: "devtools",
  Dockerfile: "devtools",
};

export function classifyRepository(input: {
  language: string | null;
  topics: string[];
  description?: string | null;
  fullName?: string;
}): RepoCategoryId {
  const topics = (input.topics || []).map((t) => t.toLowerCase());
  const blob = [
    input.fullName || "",
    input.description || "",
    ...topics,
    input.language || "",
  ]
    .join(" ")
    .toLowerCase();

  const scores: Partial<Record<RepoCategoryId, number>> = {};

  for (const [cat, keys] of Object.entries(TOPIC_MAP) as [
    Exclude<RepoCategoryId, "all" | "other">,
    string[],
  ][]) {
    let s = 0;
    for (const k of keys) {
      if (topics.includes(k)) s += 3;
      else if (blob.includes(k)) s += 1;
    }
    if (s > 0) scores[cat] = s;
  }

  if (input.language && LANG_HINTS[input.language]) {
    const hint = LANG_HINTS[input.language]!;
    scores[hint] = (scores[hint] || 0) + 1;
  }

  let best: RepoCategoryId = "other";
  let bestScore = 0;
  for (const [cat, s] of Object.entries(scores) as [RepoCategoryId, number][]) {
    if (s > bestScore) {
      bestScore = s;
      best = cat;
    }
  }
  return bestScore > 0 ? best : "other";
}

export function categoryLabel(id: RepoCategoryId): string {
  return REPO_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
