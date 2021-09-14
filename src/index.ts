import { createSlashCommandHandler } from "./discord-bot-interactions";

import helloCommand from './commands/hello';
import pingCommand from './commands/ping';
import libraryCommand from './commands/library';

global.Buffer = global.Buffer || require('buffer').Buffer;
let APPLICATION_SECRET = (global as any).APPLICATION_SECRET;

const slashCommandHandler = createSlashCommandHandler({
  applicationId: "883960159905398807",
  applicationSecret: APPLICATION_SECRET,
  publicKey: "4c5a74b3d564d7062d2b1641eff8e007c6b1b4a02a0764012343156343c06b42",
  commands: [helloCommand, pingCommand, libraryCommand],
});

addEventListener("fetch", (event) => {
  event.respondWith(slashCommandHandler(event.request));
});