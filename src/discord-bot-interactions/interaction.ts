import nacl from "tweetnacl";
import { InteractionHandler } from "./types";
import { RESTPostAPIApplicationCommandsJSONBody, APIInteraction, InteractionType, InteractionResponseType } from 'discord-api-types';

const jsonResponse = (data: any) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });

const makeValidator = ({ publicKey }: { publicKey: string }) => async (
  request: Request
) => {
  const signature = String(request.headers.get("X-Signature-Ed25519"));
  const timestamp = String(request.headers.get("X-Signature-Timestamp"));
  const body = await request.text();

  const isValid = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, "hex"),
    Buffer.from(publicKey, "hex")
  );

  if (!isValid) throw new Error("Invalid request");
};

const DEFAULT_COMMAND: RESTPostAPIApplicationCommandsJSONBody = {
  name: "ping",
  description: "ping pong",
};

const DEFAULT_HANDLER: InteractionHandler = () => ({
  type: InteractionResponseType.Pong,
});

export const interaction = ({
  publicKey,
  commands,
}: {
  publicKey: string;
  commands: [RESTPostAPIApplicationCommandsJSONBody, InteractionHandler, boolean][];
}) => {
  const validateRequest = makeValidator({ publicKey });

  return async (request: Request) => {
    try {
      await validateRequest(request.clone());

      try {
        const interaction = (await request.json()) as APIInteraction;

        if (interaction.type == InteractionType.Ping) {
          return jsonResponse({ type: 1 });
        } else if (interaction.type == InteractionType.ApplicationCommand) {
          const [command, handler, isGuild]: [
            RESTPostAPIApplicationCommandsJSONBody,
            InteractionHandler,
            boolean
          ] = commands.find(
            ([command, handler, isGuild]) => command.name === interaction.data.name
          ) || [DEFAULT_COMMAND, DEFAULT_HANDLER, true];

          return jsonResponse(await handler(interaction));
        } else if (interaction.type == InteractionType.MessageComponent) {
          return jsonResponse({ type: 1 });
        }
      } catch (e) {
        return new Response(null, { status: 400 });
      }
    } catch (e) {
      return new Response(null, { status: 401 });
    }
  };
};
