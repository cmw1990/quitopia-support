import { z } from "zod";

export const BlockingRuleSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  isEnabled: z.boolean().default(true),
  priority: z.number().int().min(0).max(100),
  schedule: z.object({
    type: z.enum(["always", "scheduled", "smart"]),
    startTime: z.string().optional(), // ISO time string
    endTime: z.string().optional(),
    days: z.array(z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])).optional(),
    smartTriggers: z.array(z.enum([
      "high_focus_needed",
      "low_energy_detected",
      "stress_detected",
      "productivity_time",
      "custom"
    ])).optional(),
  }),
  blockingMode: z.enum([
    "strict", // No override possible
    "moderate", // Override with reason
    "gentle", // Simple warning
    "monitor" // Just track usage
  ]),
  platforms: z.array(z.enum([
    "web",
    "desktop",
    "mobile",
    "browser_extension"
  ])),
  blockingRules: z.array(z.object({
    type: z.enum([
      "domain",
      "app",
      "keyword",
      "category",
      "custom_regex"
    ]),
    value: z.string(),
    exceptions: z.array(z.string()).optional(),
  })),
  adBlocking: z.object({
    enabled: z.boolean().default(true),
    level: z.enum(["basic", "aggressive", "custom"]),
    customRules: z.array(z.string()).optional(),
    allowlist: z.array(z.string()).optional(),
  }),
  notifications: z.object({
    enabled: z.boolean().default(true),
    types: z.array(z.enum([
      "block_activated",
      "block_attempt",
      "schedule_start",
      "schedule_end",
      "smart_trigger",
      "override_used"
    ])),
  }),
  analytics: z.object({
    trackAttempts: z.boolean().default(true),
    trackOverrides: z.boolean().default(true),
    trackProductivity: z.boolean().default(true),
  }),
  override: z.object({
    allowedCount: z.number().int().min(0),
    cooldownMinutes: z.number().int().min(0),
    requireReason: z.boolean().default(true),
    notifyAccountability: z.boolean().default(false),
  }),
  created_at: z.string(),
  updated_at: z.string(),
});

export type BlockingRule = z.infer<typeof BlockingRuleSchema>;

export interface DistractionMetrics {
  id: string;
  userId: string;
  timestamp: string;
  blockAttempts: number;
  successfulBlocks: number;
  overridesUsed: number;
  mostBlockedDomains: Array<{
    domain: string;
    count: number;
  }>;
  mostBlockedApps: Array<{
    app: string;
    count: number;
  }>;
  productivityScore: number;
  focusMinutes: number;
  distractionMinutes: number;
}

export interface AdBlockingStats {
  id: string;
  userId: string;
  timestamp: string;
  adsBlocked: number;
  trackersBlocked: number;
  bandwidthSaved: number;
  timesSaved: number;
  byDomain: Array<{
    domain: string;
    adsBlocked: number;
    trackersBlocked: number;
  }>;
}

export interface SmartBlockingTrigger {
  id: string;
  userId: string;
  type: string;
  condition: {
    metric: string;
    operator: ">" | "<" | "==" | ">=" | "<=";
    value: number;
  };
  action: {
    ruleId: string;
    action: "enable" | "disable" | "modify";
    modifications?: Partial<BlockingRule>;
  };
}
