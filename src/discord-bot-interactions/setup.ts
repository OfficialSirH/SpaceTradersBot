import { authorization } from "@glenstack/cf-workers-fetch-helpers";
import { InteractionHandler } from "./types";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types";

const TOKEN_URL = "https://discord.com/api/v9/oauth2/token";

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

const deleteExistingCommands = async (
  { applicationID }: { applicationID: string },
  authedFetch: typeof fetch
): Promise<void> => {
  const url = `https://discord.com/api/v9/applications/${applicationID}/commands`;
  const testGuild = `https://discord.com/api/v9/applications/${applicationID}/guilds/794054988224659490/commands`;
  const responseGuild = await authedFetch(testGuild);
  const guildCommands = await responseGuild.json();
  const response = await authedFetch(url);
  const commands = await response.json();

  await Promise.all(
    commands.map(
      (
        command: RESTPostAPIApplicationCommandsJSONBody & { id: string; application_id: string }
      ) => {
        return authedFetch(
          `https://discord.com/api/v9/applications/${applicationID}/commands/${command.id}`,
          {
            method: "DELETE",
          }
        );
      }
    )
  );
  await Promise.all(
    guildCommands.map(
      (
        command: RESTPostAPIApplicationCommandsJSONBody & { id: string; application_id: string }
      ) => {
        return authedFetch(
          `https://discord.com/api/v9/applications/${applicationID}/guilds/794054988224659490/commands/${command.id}`,
          {
            method: "DELETE",
          }
        );
      }
    )
  );
};

const createCommands = async (
  {
    applicationID,
    commands,
  }: {
    applicationID: string;
    commands: [RESTPostAPIApplicationCommandsJSONBody, InteractionHandler, boolean][];
  },
  authedFetch: typeof fetch
): Promise<Response> => {
  const url = `https://discord.com/api/v9/applications/${applicationID}/commands`;
  let guildUrl = `https://discord.com/api/v9/applications/${applicationID}/guilds/794054988224659490/commands`;
  const promises = commands.map(async ([command, handler, isGuild]) => {
    const request = new Request(isGuild ? guildUrl : url, {
      method: "POST",
      body: JSON.stringify(command),
      headers: { "Content-Type": "application/json" },
    });

    const error = new Error(`Setting command ${command.name} failed!`);

    try {
      const response = await authedFetch(request);
      if (!response.ok) throw error;
      return response;
    } catch (e) {
      throw error;
    }
  });

  return await Promise.all(promises)
    .then(() => new Response("OK"))
    .catch((e) => new Response(e.message, { status: 502 }));
};

export const setup = ({
  applicationID,
  applicationSecret,
  commands,
}: {
  applicationID: string;
  applicationSecret: string;
  commands: [RESTPostAPIApplicationCommandsJSONBody, InteractionHandler, boolean][];
}) => {
  const basicAuthFetch = authorization(fetch, {
    username: applicationID,
    password: applicationSecret,
  });

  return async (): Promise<Response> => {
    try {
      const bearer = await getAuthorizationCode(basicAuthFetch);
      const authedFetch = authorization(fetch, { bearer });

      await deleteExistingCommands({ applicationID }, authedFetch);
      return await createCommands({ applicationID, commands }, authedFetch);
    } catch {
      return new Response(
        "Failed to authenticate with Discord. Are the Application ID and secret set correctly?",
        { status: 407 }
      );
    }
  };
};