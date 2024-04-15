import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { WelcomeMessageSetupFunction } from "../functions/create_welcome_message.ts";

/**
 * This setup workflow, opens a form for the user to create a welcome message.
 * The trigger for this workflow is found in triggers/welcome_message_trigger.ts
 * The interactivity parameter enables interactive elements, like the form you'll set up next.
 */
export const MessageSetupWorkflow = DefineWorkflow({
  callback_id: "message_setup_workflow",
  title: "Create a welcome message",
  description: "Creates a message to welcome new users into the channel",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["interactivity"],
  },
});

/**
 * This step uses the OpenForm slack function. The form has two inputs:
 * - a welcome message
 * - a channel id - for the message to be posted in
 */

const SetupWorkflowForm = MessageSetupWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Setup Welcome Message",
    submit_label: "Submit",
    description: ":wave: Create a welcome message for a channel!",
    interactivity: MessageSetupWorkflow.inputs.interactivity,
    fields: {
      required: ["channel", "messageInput"],
      elements: [
        {
          name: "messageInput",
          title: "Your welcome message",
          type: Schema.types.string,
          long: true,
        },
        {
          name: "channel",
          title: "Select a channel to post this message in",
          type: Schema.slack.types.channel_id,
          default: MessageSetupWorkflow.inputs.channel,
        },
      ],
    },
  },
);

/**
 * The next step takes the form output and passes it along to a custom function
 * which sets the welcome message up.
 * see /functions/setup_function.ts for more information
 * Each attribute is a type of information you want to store.
 * In this case, it's the information from the form submission.
 */
MessageSetupWorkflow.addStep(WelcomeMessageSetupFunction, {
  message: SetupWorkflowForm.outputs.fields.messageInput,
  channel: SetupWorkflowForm.outputs.fields.channel,
  author: MessageSetupWorkflow.inputs.interactivity.interactor.id,
});

/**
 * The next step uses the SendEphemeralMessage slack function
 * An ephemeral confirmation message will be sent to the user
 * creating the welcome message, after the user submits the above form.
 */

MessageSetupWorkflow.addStep(Schema.slack.functions.SendEphemeralMessage, {
  channel_id: SetupWorkflowForm.outputs.fields.channel,
  user_id: MessageSetupWorkflow.inputs.interactivity.interactor.id,
  message:
    `Your welcome message for this channel was successfully created! :white_check_mark:`,
});

export default MessageSetupWorkflow;
