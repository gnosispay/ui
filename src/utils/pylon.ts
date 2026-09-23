import { PYLON_APP_ID } from "@/constants";

export type PylonTheme = "light" | "dark";

export interface PylonChatSettings {
  app_id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
}

interface PylonApi {
  (command: "show" | "hide" | "showChatBubble" | "hideChatBubble"): void;
  (command: "setTheme", theme: PylonTheme): void;
  (command: "showNewMessage", message: string): void;
  (command: "setNewIssueCustomFields", fields: Record<string, string>): void;
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

export const setPylonNewIssueCustomFields = (fields: Record<string, string>) => {
  window.Pylon?.("setNewIssueCustomFields", fields);
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

export const showPylonChatBubble = () => {
  window.Pylon?.("showChatBubble");
};

export const hidePylonChatBubble = () => {
  window.Pylon?.("hideChatBubble");
};

export const setPylonOnHide = (callback: (() => void) | null) => {
  window.Pylon?.("onHide", callback);
};
