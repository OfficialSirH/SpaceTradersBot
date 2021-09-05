import { InteractionHandler } from "./types";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types";
import { Router } from "@glenstack/cf-workers-router";
import { authorize } from "./authorize";
import { interaction } from "./interaction";
import { setup } from "./setup";
export * from "./types";

const router = new Router();

export const createSlashCommandHandler = ({
  applicationID,
  applicationSecret,
  publicKey,
  commands,
}: {
  applicationID: string;
  applicationSecret: string;
  publicKey: string;
  commands: [RESTPostAPIApplicationCommandsJSONBody, InteractionHandler, boolean][];
}) => {
  router.get("/", authorize({ applicationID }));
  router.post("/interaction", interaction({ publicKey, commands }) as any);
  router.get("/setup", setup({ applicationID, applicationSecret, commands }));
  return (request: Request) => router.route(request);
};
