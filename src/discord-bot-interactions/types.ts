import type { APIApplicationCommandInteraction, APIInteraction, APIInteractionResponse, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types";

export type InteractionHandler = (
  interaction: APIApplicationCommandInteraction
) => Promise<InteractionHandlerReturn> | InteractionHandlerReturn;

export type InteractionHandlerReturn = Partial<APIInteractionResponse> & { files?: DiscordFile[] };

export interface DiscordFile {
  name: string;
  data: string;
}

export interface SlashCommand {
  testing?: boolean;
  data: RESTPostAPIApplicationCommandsJSONBody;
  handle: InteractionHandler;
}

export type SetupFunction = (options: SetupOptions, authedFetch: typeof fetch) => Promise<void>;

export interface SetupOptions {
  applicationId: string;
  commands: Array<SlashCommand>;
  globalCommands: Array<APIApplicationCommandInteraction>;
  guildCommands: Array<APIApplicationCommandInteraction>;
}