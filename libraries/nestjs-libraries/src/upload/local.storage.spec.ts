import { mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { LocalStorage } from './local.storage';

jest.mock('file-type', () => ({
  fromBuffer: jest.fn().mockResolvedValue({ ext: 'png', mime: 'image/png' }),
}));

describe('LocalStorage', () => {
  const originalFrontendUrl = process.env.FRONTEND_URL;
  let uploadDirectory: string;

  beforeEach(() => {
    uploadDirectory = mkdtempSync(join(tmpdir(), 'postiz-upload-'));
    process.env.FRONTEND_URL = 'https://staging.example.test';
  });

  afterEach(() => {
    rmSync(uploadDirectory, { recursive: true, force: true });
    process.env.FRONTEND_URL = originalFrontendUrl;
  });

  it('preserves the public HTTPS path and returns the persisted byte count', async () => {
    const storage = new LocalStorage(uploadDirectory);
    const buffer = Buffer.from('local upload contents');
    const uploadedFile = await storage.uploadFile({
      buffer,
      size: buffer.length,
    } as Express.Multer.File);

    expect(uploadedFile.size).toBe(buffer.length);
    expect(uploadedFile.path).toMatch(
      /^https:\/\/staging\.example\.test\/uploads\/\d{4}\/\d{2}\/\d{2}\/[a-f0-9]+\.png$/
    );

    const relativePath = new URL(uploadedFile.path).pathname.replace(
      '/uploads',
      ''
    );
    expect(readFileSync(`${uploadDirectory}${relativePath}`)).toEqual(buffer);
  });
});
