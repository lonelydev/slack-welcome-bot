import { Manifest } from "deno-slack-sdk/mod.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/future/manifest
 */
export default Manifest({
  name: "Welcome Message Bot",
  description: "A quick way to setup automated welcome messages for channels in your workplace",
  icon: "assets/default_new_app_icon.png",
  workflows: [MessageSetupWorkflow, SendWelcomeMessageWorkflow],
  outgoingDomains: [],
  datastores: [WelcomeMessageDatastore],
  botScopes: [
    "chat:write",
    "chat:write.public",
    "datastores:read",
    "datastores:write",
    "channels:read",
    "triggers:read",
    "triggers:write",
  ],
});
