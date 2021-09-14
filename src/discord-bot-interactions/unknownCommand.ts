import { InteractionResponseType } from "discord-api-types";
import type { SlashCommand } from ".";

const unknown: Omit<SlashCommand, 'data'> = {
    handle: (interaction) => {
        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: "Unknown command",
                flags: 64
            }
        }
    }
}

export default unknown;