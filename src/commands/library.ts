import { APIInteractionResponseCallbackData, ApplicationCommandOptionType, InteractionResponseType } from 'discord-api-types';
import type { InteractionHandlerReturn, SlashCommand } from '../discord-bot-interactions/types';

const library: SlashCommand = {
    data: {
        name: 'library',
        description: 'Query a specific structure from the library(testing library functionality)',
        options: [
            {
                name: 'query',
                description: 'Query the library for a specific item',
                type: ApplicationCommandOptionType.String,
                required: true,
            }
        ],
    },
    handle: async (interaction) => {
        const library = await import('spacetraders.ts');
        const query = (interaction.data.options![0] as any).value as string;
        const libraryStructures = Object.keys(library);
        const result = {
            files: [],
            type: InteractionResponseType.ChannelMessageWithSource,
            data: { }
        } as InteractionHandlerReturn;
        libraryStructures.includes(query) ? result.files?.push({ name: `${query}.js`, data: `it's supposed to be ${query} data, but library is being a poopoo right now so I'm having it default to this, sowwy.` }) : 
        ((result as any).data as APIInteractionResponseCallbackData).content = 'No results found';
        return result;
    }
}

export default library;