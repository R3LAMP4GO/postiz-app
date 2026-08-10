import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { GET, HEAD } from './route';

describe('local upload route', () => {
  const originalUploadDirectory = process.env.UPLOAD_DIRECTORY;
  let uploadDirectory: string;
  const context = (path: string[]) => ({
    params: Promise.resolve({ path }),
  });

  beforeEach(() => {
    uploadDirectory = mkdtempSync(join(tmpdir(), 'postiz-upload-route-'));
    process.env.UPLOAD_DIRECTORY = uploadDirectory;
    writeFileSync(join(uploadDirectory, 'video.mp4'), 'abcdefghij');
  });

  afterEach(() => {
    rmSync(uploadDirectory, { recursive: true, force: true });
    process.env.UPLOAD_DIRECTORY = originalUploadDirectory;
  });

  it('serves a complete file with range support headers', async () => {
    const response = await GET(
      new Request('http://localhost/uploads/video.mp4') as any,
      context(['video.mp4'])
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('accept-ranges')).toBe('bytes');
    expect(response.headers.get('content-length')).toBe('10');
    expect(await response.text()).toBe('abcdefghij');
  });

  it('serves requested byte ranges', async () => {
    const response = await GET(
      new Request('http://localhost/uploads/video.mp4', {
        headers: { range: 'bytes=2-5' },
      }) as any,
      context(['video.mp4'])
    );

    expect(response.status).toBe(206);
    expect(response.headers.get('content-range')).toBe('bytes 2-5/10');
    expect(response.headers.get('content-length')).toBe('4');
    expect(await response.text()).toBe('cdef');
  });

  it('serves suffix ranges and HEAD responses without a body', async () => {
    const rangeResponse = await GET(
      new Request('http://localhost/uploads/video.mp4', {
        headers: { range: 'bytes=-3' },
      }) as any,
      context(['video.mp4'])
    );
    const headResponse = await HEAD(
      new Request('http://localhost/uploads/video.mp4') as any,
      context(['video.mp4'])
    );

    expect(rangeResponse.status).toBe(206);
    expect(await rangeResponse.text()).toBe('hij');
    expect(headResponse.status).toBe(200);
    expect(headResponse.headers.get('content-length')).toBe('10');
    expect(await headResponse.text()).toBe('');
  });

  it('rejects unsatisfiable ranges and traversal paths', async () => {
    const rangeResponse = await GET(
      new Request('http://localhost/uploads/video.mp4', {
        headers: { range: 'bytes=20-30' },
      }) as any,
      context(['video.mp4'])
    );
    const traversalResponse = await GET(
      new Request('http://localhost/uploads/secret.txt') as any,
      context(['..', 'secret.txt'])
    );

    expect(rangeResponse.status).toBe(416);
    expect(rangeResponse.headers.get('content-range')).toBe('bytes */10');
    expect(traversalResponse.status).toBe(404);
  });
});
