import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';

export const PLATFORMS = [
  'x',
  'tiktok',
  'instagram',
  'instagram-standalone',
  'linkedin',
  'linkedin-page',
  'youtube',
  'threads',
  'bluesky',
  'facebook',
  'pinterest',
  'reddit',
] as const;
export type Platform = (typeof PLATFORMS)[number];

const DEFAULT_VARIANTS: Partial<Record<Platform, string>> = {
  x: 'twitter_tweets',
  tiktok: 'tiktok_shorts',
  instagram: 'instagram_reels',
  'instagram-standalone': 'instagram_reels',
  linkedin: 'linkedin_posts',
  'linkedin-page': 'linkedin_posts',
  youtube: 'youtube_titles',
};

const EXAMPLE_CATEGORIES: Partial<Record<Platform, string>> = {
  x: 'twitter_hooks',
  youtube: 'youtube_titles',
  instagram: 'instagram_hooks',
  'instagram-standalone': 'instagram_hooks',
};

const MAX_EXAMPLES = 5;

interface ChecklistYaml {
  name?: string;
  rules?: string[];
  templates?: string[];
}

interface ExampleItem {
  original?: string;
  creator?: string;
  template?: string;
  views?: number;
}

@Injectable()
export class PromptResolverService {
  private readonly logger = new Logger(PromptResolverService.name);
  private readonly cache = new Map<string, string | null>();
  private examplesPool: Record<string, Array<ExampleItem | string>> | null =
    null;

  private get basePath(): string {
    return process.env.CUSTOM_PROMPTS_PATH || '/app/custom-prompts';
  }

  private get examplesPath(): string {
    return process.env.EXAMPLES_YAML_PATH || join(this.basePath, 'examples.yaml');
  }

  private get includeExamples(): boolean {
    return process.env.INCLUDE_EXAMPLES !== 'false';
  }

  private resolveVariant(platform: Platform): string | null {
    const envOverride = process.env[`YAML_VARIANT_${platform.toUpperCase().replace(/-/g, '_')}`];
    if (envOverride) return envOverride;
    return DEFAULT_VARIANTS[platform] ?? null;
  }

  async loadPlatformRules(
    platform: string,
    orgId?: string,
    inlineOverride?: string
  ): Promise<string | null> {
    if (!(PLATFORMS as readonly string[]).includes(platform)) return null;
    const p = platform as Platform;
    const variant = this.resolveVariant(p);
    if (!variant) return null;

    const cacheKey = `${orgId ?? '_default'}:${p}:${variant}:${this.includeExamples}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return this.appendOverride(cached, inlineOverride);
    }

    const rules = await this.loadAndTransformRules(variant);
    if (!rules) {
      this.cache.set(cacheKey, null);
      return null;
    }

    const examples = this.includeExamples ? await this.loadExamples(p) : '';
    const block = examples ? `${rules}\n\n${examples}` : rules;
    this.cache.set(cacheKey, block);

    if (orgId) this.logger.debug(`resolver: orgId=${orgId} ignored (phase 2 global)`);
    return this.appendOverride(block, inlineOverride);
  }

  async loadRulesForIntegrations(
    integrations: Array<{ platform?: string } | string> | undefined,
    orgId?: string,
    inlineOverride?: string
  ): Promise<string | null> {
    if (!integrations?.length) return null;
    const platforms = Array.from(
      new Set(
        integrations
          .map((i) => (typeof i === 'string' ? i : i?.platform))
          .filter((p): p is string => !!p)
      )
    );

    const blocks: string[] = [];
    for (const platform of platforms) {
      const rules = await this.loadPlatformRules(platform, orgId);
      if (rules) blocks.push(`# Platform: ${platform}\n\n${rules}`);
    }

    if (!blocks.length) return null;
    const combined = blocks.join('\n\n---\n\n');
    return this.appendOverride(combined, inlineOverride);
  }

  private async loadAndTransformRules(variant: string): Promise<string | null> {
    try {
      const raw = await fs.readFile(join(this.basePath, `${variant}.yaml`), 'utf8');
      const parsed = parseYaml(raw) as ChecklistYaml;
      return this.transformRules(parsed);
    } catch (err: any) {
      if (err?.code !== 'ENOENT') {
        this.logger.warn(`failed to load ${variant}.yaml: ${err?.message ?? err}`);
      }
      return null;
    }
  }

  private transformRules(parsed: ChecklistYaml): string {
    const lines: string[] = [];
    if (parsed?.name) lines.push(`## ${parsed.name}`);
    for (const rule of parsed?.rules ?? []) lines.push(`- ${rule}`);
    for (const tmpl of parsed?.templates ?? []) lines.push(`  Template: ${tmpl}`);
    return lines.join('\n');
  }

  private async loadExamples(platform: Platform): Promise<string> {
    const category = EXAMPLE_CATEGORIES[platform];
    if (!category) return '';

    if (!this.examplesPool) {
      try {
        const raw = await fs.readFile(this.examplesPath, 'utf8');
        this.examplesPool = parseYaml(raw) ?? {};
      } catch {
        this.examplesPool = {};
      }
    }

    const items = this.examplesPool?.[category] ?? [];
    if (!items.length) return '';

    const picked = [...items].sort(() => Math.random() - 0.5).slice(0, MAX_EXAMPLES);
    const formatted = picked.map((item) => {
      if (typeof item === 'string') return `- "${item}"`;
      const tag = item.creator ? ` (${item.creator})` : '';
      return `- "${item.original ?? ''}"${tag}`;
    });
    return `## Few-shot examples\n${formatted.join('\n')}`;
  }

  private appendOverride(base: string | null, inlineOverride?: string): string | null {
    if (!base) return null;
    if (!inlineOverride) return base;
    return `${base}\n\n## Additional instructions\n${inlineOverride}`;
  }
}
