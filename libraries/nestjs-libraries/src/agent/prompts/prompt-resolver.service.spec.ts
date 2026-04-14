import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { PromptResolverService } from './prompt-resolver.service';

describe('PromptResolverService', () => {
  let fixtureDir: string;
  let service: PromptResolverService;
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    fixtureDir = await fs.mkdtemp(join(tmpdir(), 'postiz-prompts-'));
    process.env.CUSTOM_PROMPTS_PATH = fixtureDir;
    delete process.env.INCLUDE_EXAMPLES;

    await fs.writeFile(
      join(fixtureDir, 'tiktok_shorts.yaml'),
      'name: "TikTok Rules"\nrules:\n  - "100 chars max"\n  - "Hook first"\n'
    );
    await fs.writeFile(
      join(fixtureDir, 'twitter_tweets.yaml'),
      'name: "Tweets"\nrules:\n  - "280 chars"\n'
    );
    await fs.writeFile(
      join(fixtureDir, 'examples.yaml'),
      `twitter_hooks:\n  - "hook one"\n  - "hook two"\n  - "hook three"\n  - "hook four"\n  - "hook five"\n  - "hook six"\n  - "hook seven"\n`
    );
    service = new PromptResolverService();
  });

  afterEach(async () => {
    process.env = { ...originalEnv };
    await fs.rm(fixtureDir, { recursive: true, force: true });
  });

  it('loads tiktok rules with header + bullets', async () => {
    const out = await service.loadPlatformRules('tiktok');
    expect(out).toContain('## TikTok Rules');
    expect(out).toContain('- 100 chars max');
    expect(out).toContain('- Hook first');
  });

  it('maps x -> twitter_tweets.yaml', async () => {
    const out = await service.loadPlatformRules('x');
    expect(out).toContain('## Tweets');
    expect(out).toContain('- 280 chars');
  });

  it('returns null for platforms without a YAML file', async () => {
    const out = await service.loadPlatformRules('bluesky');
    expect(out).toBeNull();
  });

  it('returns null for unknown provider', async () => {
    const out = await service.loadPlatformRules('unknown-platform');
    expect(out).toBeNull();
  });

  it('caps examples at 5', async () => {
    const out = await service.loadPlatformRules('x');
    const matches = out?.match(/- "hook/g) ?? [];
    expect(matches.length).toBe(5);
  });

  it('omits examples when INCLUDE_EXAMPLES=false', async () => {
    process.env.INCLUDE_EXAMPLES = 'false';
    const svc = new PromptResolverService();
    const out = await svc.loadPlatformRules('x');
    expect(out).not.toContain('Few-shot examples');
    expect(out).toContain('- 280 chars');
  });

  it('appends inline override under Additional instructions', async () => {
    const out = await service.loadPlatformRules('tiktok', undefined, 'be sarcastic');
    expect(out).toContain('## Additional instructions');
    expect(out).toContain('be sarcastic');
  });

  it('respects YAML_VARIANT_X env override', async () => {
    await fs.writeFile(
      join(fixtureDir, 'twitter_articles.yaml'),
      'name: "Articles"\nrules:\n  - "long form"\n'
    );
    process.env.YAML_VARIANT_X = 'twitter_articles';
    const svc = new PromptResolverService();
    const out = await svc.loadPlatformRules('x');
    expect(out).toContain('## Articles');
  });

  it('loadRulesForIntegrations dedupes platforms + combines blocks', async () => {
    const out = await service.loadRulesForIntegrations([
      { platform: 'tiktok' },
      { platform: 'tiktok' },
      { platform: 'x' },
    ]);
    expect(out).toContain('# Platform: tiktok');
    expect(out).toContain('# Platform: x');
    expect(out).toContain('## TikTok Rules');
    expect(out).toContain('## Tweets');
  });

  it('loadRulesForIntegrations returns null when no platforms match', async () => {
    const out = await service.loadRulesForIntegrations([
      { platform: 'bluesky' },
      { platform: 'threads' },
    ]);
    expect(out).toBeNull();
  });
});
