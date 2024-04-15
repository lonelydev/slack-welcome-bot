import { Trigger } from "deno-slack-api/types.ts";
import MessageSetupWorkflow from "../workflows/create_welcome_message.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

/**
 * This is a link trigger that prompts the MessageSetupWorkflow
 * This defines a trigger that will kick off the provided workflow,
 * message_setup_workflow,
 * along with an added bonus: it'll pass along the channel ID of the channel it was started in.
 */

const welcomeMessageTrigger: Trigger<typeof MessageSetupWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Setup a Welcome Message",
  description:
    "Creates an automated welcome message for a given channel to be shown when a person joins the channel",
  workflow: `#/workflows/${MessageSetupWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
  },
};

export default welcomeMessageTrigger;
