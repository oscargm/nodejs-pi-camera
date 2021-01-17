import { StreamCamera, Codec } from 'pi-camera-connect';
import WebSocket from 'ws';
import * as fs from 'fs';

const bootstrap = () => {
  const wss = new WebSocket.Server({ port: 8082 });
  wss.on('connection', (ws: WebSocket) => {
    runApp(ws);
  });
};

const runApp = async (ws: WebSocket) => {
  const streamCamera = new StreamCamera({
    codec: Codec.H264,
  });

  const videoStream = streamCamera.createStream();

  const writeStream = fs.createWriteStream('video-stream.h264');

  // Pipe the video stream to our video file
  videoStream.pipe(writeStream);

  await streamCamera.startCapture();

  // We can also listen to data events as they arrive
  videoStream.on('data', (data) => console.log('New data', ws.send(data)));
  videoStream.on('end', (data) => console.log('Video stream has ended'));

  // Wait for 5 seconds
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 5000));

  await streamCamera.stopCapture();
};

bootstrap();
