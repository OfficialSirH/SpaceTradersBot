import {
  createSlashCommandHandler,
  InteractionHandler,
} from "./discord-bot-interactions";
import { RESTPostAPIApplicationCommandsJSONBody, APIInteractionResponse, APIInteraction, InteractionResponseType } from 'discord-api-types';

global.Buffer = global.Buffer || require('buffer').Buffer;
let APPLICATION_SECRET = (global as any).APPLICATION_SECRET;

const helloCommand: RESTPostAPIApplicationCommandsJSONBody = {
  name: "hello",
  description: "Bot will say hello to you!"
};

const helloHandler: InteractionHandler = async (
  interaction: APIInteraction
): Promise<APIInteractionResponse> => {
  const userID = interaction.member!.user.id;

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: `Hello, <@${userID}>!`,
      allowed_mentions: {
        users: [userID],
      },
    },
  };
};

const pingCommand: RESTPostAPIApplicationCommandsJSONBody = {
  name: "ping",
  description: "Bot will say pong to you!"
};

const pingHandler: InteractionHandler = async (
  interaction: APIInteraction
): Promise<APIInteractionResponse> => {
  const userID = !!interaction.guild_id ? interaction.member!.user.id : interaction.user!.id;

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: `Pong, <@${userID}>!`,
      allowed_mentions: {
        users: [userID],
      },
    },
  };
};

// TODO: create file for each command and create a type for the command array
const slashCommandHandler = createSlashCommandHandler({
  applicationID: "883960159905398807",
  applicationSecret: APPLICATION_SECRET,
  publicKey: "4c5a74b3d564d7062d2b1641eff8e007c6b1b4a02a0764012343156343c06b42",
  commands: [[helloCommand, helloHandler, true], [pingCommand, pingHandler, false]],
});

addEventListener("fetch", (event) => {
  event.respondWith(slashCommandHandler(event.request));
});