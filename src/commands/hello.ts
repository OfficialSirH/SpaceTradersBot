import { InteractionResponseType } from "discord-api-types";
import type { SlashCommand } from "../discord-bot-interactions";

const hello: SlashCommand = {
    testing: true,
    data: {
        name: "hello",
        description: "Bot will say hello to you!",
    },
    handle: (interaction) => {
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
    }
}

export default hello;