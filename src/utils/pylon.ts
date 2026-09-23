import { PYLON_APP_ID } from "@/constants";

export type PylonTheme = "light" | "dark";

export interface PylonChatSettings {
  app_id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
}

export type PylonCustomFields = Record<string, string | number | boolean | null | undefined>;

interface PylonApi {
  (command: "show" | "hide" | "hideChatBubble"): void;
  (command: "setTheme", theme: PylonTheme): void;
  (command: "setNewIssueCustomFields" | "setTicketFormFields", fields: PylonCustomFields): void;
  (command: "showNewMessage", message: string): void;
  (command: "onShow" | "onHide", callback: (() => void) | null): void;
}

declare global {
  interface Window {
    Pylon?: PylonApi;
    pylon?: { chat_settings: PylonChatSettings };
  }
}

export const setPylonChatSettings = (settings: Omit<PylonChatSettings, "app_id">) => {
  window.pylon = {
    chat_settings: {
      app_id: PYLON_APP_ID,
      ...settings,
    },
  };
};

/**
 * Custom fields have to be keyed by their Pylon slug, not their label. Pylon splits them in two:
 * `setNewIssueCustomFields` covers issues opened from the chat module, `setTicketFormFields`
 * prefills the ticket forms. Unknown slugs are ignored, so both can be sent unconditionally.
 */
export const setPylonCustomFields = (fields: PylonCustomFields) => {
  window.Pylon?.("setNewIssueCustomFields", fields);
  window.Pylon?.("setTicketFormFields", fields);
};

export const setPylonTheme = (theme: PylonTheme) => {
  window.Pylon?.("setTheme", theme);
};

export const showPylonChat = () => {
  window.Pylon?.("show");
};

export const hidePylonChat = () => {
  window.Pylon?.("hide");
};

export const hidePylonChatBubble = () => {
  window.Pylon?.("hideChatBubble");
};

export const setPylonOnShow = (callback: (() => void) | null) => {
  window.Pylon?.("onShow", callback);
};

export const setPylonOnHide = (callback: (() => void) | null) => {
  window.Pylon?.("onHide", callback);
};
