import { authorization } from "@glenstack/cf-workers-fetch-helpers";
import type { SetupFunction, SlashCommand } from ".";

const TOKEN_URL = "https://discord.com/api/v9/oauth2/token";
const GLOBAL_URL = (applicationId: string) => `https://discord.com/api/v9/applications/${applicationId}/commands`;
const GUILD_URL = (applicationId: string) => `https://discord.com/api/v9/applications/${applicationId}/guilds/794054988224659490/commands`;

const getAuthorizationCode = async (authedFetch: typeof fetch) => {
  const request = new Request(TOKEN_URL, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "applications.commands.update",
    }).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const response = await authedFetch(request);
  if (!response.ok) throw new Error("Failed to request an Authorization code.");

  try {
    const data = await response.json();
    return data.access_token;
  } catch {
    throw new Error("Failed to parse the Authorization code response.");
  }
};

const setCommands: SetupFunction = async (
  { applicationId, commands }, authedFetch) => {
    const guildCommands = commands.filter(command => command.testing).map(command => command.data);
    const globalCommands = commands.filter(command => !command.testing).map(command => command.data);
    
    const guildRequest = new Request(GUILD_URL(applicationId), {
      method: "PUT",
      body: JSON.stringify(guildCommands),
      headers: { "Content-Type": "application/json" },
    });

    const globalRequest = new Request(GLOBAL_URL(applicationId), {
      method: "PUT",
      body: JSON.stringify(globalCommands),
      headers: { "Content-Type": "application/json" },
    });

    const error = new Error(`Setting commands has failed: `);

    try {
      const guildResponse = await authedFetch(guildRequest);
      if (!guildResponse.ok) {
        error.message += `Guild: ${guildResponse.statusText}`;
        throw error;
      }
      const globalResponse = await authedFetch(globalRequest);
      if (!globalResponse.ok) {
        error.message += `Global: ${globalResponse.statusText}`; 
        throw error;
      }
    } catch (e) {
      if (!error.message.startsWith((e as Error).message)) error.message += (e as Error).message;
      throw error;
    }
};


export const setup = ({
  applicationId,
  applicationSecret,
  commands,
}: {
  applicationId: string;
  applicationSecret: string;
  commands: Array<SlashCommand>;
}) => {
  const basicAuthFetch = authorization(fetch, {
    username: applicationId,
    password: applicationSecret,
  });

  return async (): Promise<Response> => {
    try {
      const bearer = await getAuthorizationCode(basicAuthFetch);
      const authedFetch = authorization(fetch, { bearer });

      const responseGuild = await authedFetch(GUILD_URL(applicationId));
      const guildCommands = await responseGuild.json();

      const responseGlobal = await authedFetch(GLOBAL_URL(applicationId));
      const globalCommands = await responseGlobal.json();

      return setCommands({ applicationId, commands, globalCommands, guildCommands }, authedFetch)
      .then(() => new Response("OK"))
      .catch((e) => new Response(e.message, { status: 502 }));
    } catch {
      return new Response(
        "Failed to authenticate with Discord. Are the Application ID and secret set correctly?",
        { status: 407 }
      );
    }
  };
};