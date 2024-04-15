import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { WelcomeMessageDatastore } from "../datastores/messages.ts";

/**
 * This custom function will pull the stored message from the datastore
 * and send it to the joining user as an ephemeral message in the specified channel.
 */
export const SendWelcomeMessageFunction = DefineFunction({
  callback_id: "send_welcome_message_function",
  title: "Sending the welcome message",
  description:
    "Pull the welcome message from the datastore and sends it to the new user",
  source_file: "functions/send_welcome_message.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
        description: "Channel where the event was triggered",
      },
      triggered_user: {
        type: Schema.slack.types.user_id,
        description:
          "User that triggered the event - the one that joined the channel",
      },
    },
    required: ["channel", "triggered_user"],
  },
});

/***
 * This creates a function that:
 * - queries the datastore for stored messages
 * - posts an ephemeral message using the message item from the datastore
 * with a matching channel channel ID value to the user with the triggered_user user ID.
 */
export default SlackFunction(
  SendWelcomeMessageFunction,
  async ({ inputs, client }) => {
    //query the datastore for stored messages
    const messages = await client.apps.datastore.query<
      typeof WelcomeMessageDatastore.definition
    >({
      datastore: WelcomeMessageDatastore.name,
      expression: "#channel = :mychannel",
      expression_attributes: { "#channel": "channel" },
      expression_values: { ":mychannel": inputs.channel },
    });

    if (!messages.ok) {
      return {
        error: `Failed to gather welcome messages: ${messages.error}`,
      };
    }

    // send the stored messages ephemerally
    for (const item of messages["items"]) {
      const message = await client.chat.postEphemeral({
        channel: item["channel"],
        text: item["message"],
        user: inputs.triggered_user,
      });

      if (!message.ok) {
        return {
          error: `Failed to send welcome message: ${message.error}`,
        };
      }
    }
    return {
      outputs: {},
    };
  },
);
