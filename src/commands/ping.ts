import { InteractionResponseType } from "discord-api-types";
import type { SlashCommand } from "../discord-bot-interactions";

const ping: SlashCommand = {
    data: {
        name: "ping",
        description: "Bot will say pong to you!"
    },
    handle: async (interaction) => {
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
    }
}

export default ping;