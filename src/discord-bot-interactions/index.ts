import { Router } from "@glenstack/cf-workers-router";
import { authorize } from "./authorize";
import { interaction } from "./interaction";
import { setup } from "./setup";
import type { SlashCommand } from "./types";
export * from "./types";

const router = new Router();

export const createSlashCommandHandler = ({
  applicationId,
  applicationSecret,
  publicKey,
  commands,
}: {
  applicationId: string;
  applicationSecret: string;
  publicKey: string;
  commands: Array<SlashCommand>;
}) => {
  router.get("/", authorize({ applicationId }));
  router.post("/interaction", interaction({ publicKey, commands }));
  router.get("/setup", setup({ applicationId, applicationSecret, commands }));
  return (request: Request) => router.route(request);
};