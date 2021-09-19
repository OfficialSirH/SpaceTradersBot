import nacl from "tweetnacl";
import type { SlashCommand } from "./types";
import { APIInteraction, InteractionType } from 'discord-api-types';
import unknownCommand from './unknownCommand'; 
import type { InteractionHandlerReturn } from ".";

const isFileUpload = (data: InteractionHandlerReturn) =>
  data.files && data.files.length > 0;

const formDataResponse = (data: InteractionHandlerReturn) => {
  const formData = new FormData();
  data.files?.forEach((file) => formData.append(file.name, new Blob([file.data]), file.name));
  delete data.files;
  formData.append("payload_json", JSON.stringify(data));
  return new Response(formData);
};

const jsonResponse = (data: InteractionHandlerReturn) =>
  isFileUpload(data) ? formDataResponse(data) : 
  new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });

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

export const interaction = ({
  publicKey,
  commands,
}: {
  publicKey: string;
  commands: Array<SlashCommand>;
}) => {
  const validateRequest = makeValidator({ publicKey });

  return async (request: Request) => {
    return validateRequest(request.clone())
    .then(async () => {
      return (request.json() as Promise<APIInteraction>)
      .then(async interaction => {
        if (interaction.type == InteractionType.Ping) {
          return jsonResponse({ type: 1 });
        } else if (interaction.type == InteractionType.ApplicationCommand) {
          const command = commands.find(
            command => command.data.name === interaction.data.name
          ) as SlashCommand || unknownCommand;

          return jsonResponse(await command.handle(interaction));
        } else if (interaction.type == InteractionType.MessageComponent) {
          return jsonResponse({ type: 1 });
        }
      })
      .catch(() => new Response(null, { status: 400 }));
    })
    .catch(() => new Response(null, { status: 401 })) as Promise<Response>;
  };
};
