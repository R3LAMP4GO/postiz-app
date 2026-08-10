import { NextRequest } from 'next/server';
import { createReadStream, statSync } from 'fs';
import { resolve, sep } from 'path';
// @ts-ignore
import mime from 'mime';

async function* nodeStreamToIterator(stream: any) {
  for await (const chunk of stream) {
    yield chunk;
  }
}

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(new Uint8Array(value));
      }
    },
  });
}

function parseRange(range: string | null, size: number) {
  const match = range?.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return null;

  const [, startText, endText] = match;
  const requestedStart = startText ? Number(startText) : undefined;
  const requestedEnd = endText ? Number(endText) : undefined;

  if (
    (requestedStart !== undefined &&
      (!Number.isInteger(requestedStart) || requestedStart < 0)) ||
    (requestedEnd !== undefined &&
      (!Number.isInteger(requestedEnd) || requestedEnd < 0)) ||
    (requestedStart === undefined && requestedEnd === undefined)
  ) {
    return null;
  }

  if (requestedStart === undefined) {
    const suffixLength = Math.min(requestedEnd!, size);
    if (suffixLength === 0) return null;
    return { start: size - suffixLength, end: size - 1 };
  }

  if (
    requestedStart >= size ||
    (requestedEnd !== undefined && requestedEnd < requestedStart)
  ) {
    return null;
  }
  return {
    start: requestedStart,
    end: Math.min(requestedEnd ?? size - 1, size - 1),
  };
}

type UploadRouteContext = {
  params: Promise<{ path?: string[] }>;
};

const serveUpload = async (
  request: NextRequest,
  context: UploadRouteContext,
  includeBody: boolean
) => {
  const { path } = await context.params;
  const base = resolve(process.env.UPLOAD_DIRECTORY!);
  const filePath = resolve(base, (path ?? []).join('/'));
  // Confine reads to UPLOAD_DIRECTORY. resolve() collapses any `..` segments
  // (including URL-decoded ones), so this blocks every path-traversal variant.
  if (filePath !== base && !filePath.startsWith(base + sep)) {
    return new Response('Not found', { status: 404 });
  }

  const fileStats = statSync(filePath);
  const contentType = mime.getType(filePath) || 'application/octet-stream';
  const byteRange = parseRange(request.headers.get('range'), fileStats.size);
  const headers = new Headers({
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Last-Modified': fileStats.mtime.toUTCString(),
    'Cache-Control': 'public, max-age=31536000, immutable',
  });

  if (byteRange) {
    const { start, end } = byteRange;
    headers.set('Content-Length', String(end - start + 1));
    headers.set('Content-Range', `bytes ${start}-${end}/${fileStats.size}`);
    const stream = includeBody
      ? iteratorToStream(
          nodeStreamToIterator(createReadStream(filePath, { start, end }))
        )
      : null;
    return new Response(stream, { status: 206, headers });
  }

  if (request.headers.has('range')) {
    headers.set('Content-Range', `bytes */${fileStats.size}`);
    headers.set('Content-Length', '0');
    return new Response(null, { status: 416, headers });
  }

  headers.set('Content-Length', String(fileStats.size));
  const stream = includeBody
    ? iteratorToStream(nodeStreamToIterator(createReadStream(filePath)))
    : null;
  return new Response(stream, { headers });
};

export const GET = (request: NextRequest, context: UploadRouteContext) =>
  serveUpload(request, context, true);

export const HEAD = (request: NextRequest, context: UploadRouteContext) =>
  serveUpload(request, context, false);
