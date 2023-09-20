import type { NextApiResponse } from 'next';

export function responseWriteController({
  res,
  readStream
}: {
  res: NextApiResponse;
  readStream: any;
}) {
  res.on('drain', () => {
    readStream.resume();
  });

  return (text: string) => {
    const writeResult = res.write(text);
    if (!writeResult) {
      console.log('Pause read stream');
      readStream.pause();
    }
  };
}

export function responseWrite({
  res,
  write,
  event,
  data
}: {
  res?: NextApiResponse;
  write?: (text: string) => void;
  event?: string;
  data: string;
}) {
  const Write = write || res?.write;

  if (!Write) return;

  event && Write(`event: ${event}\n`);
  Write(`data: ${data}\n\n`);
}
