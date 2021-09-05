import { APIApplicationCommandInteraction, APIInteractionResponse } from "discord-api-types";

export type InteractionHandler = (
  interaction: APIApplicationCommandInteraction
) => Promise<APIInteractionResponse> | APIInteractionResponse;