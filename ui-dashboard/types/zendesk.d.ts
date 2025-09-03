declare global {
  interface Window {
    zE: (
      widget: "messenger" | "messenger:on" | "messenger:set",
      action:
        | "show"
        | "hide"
        | "open"
        | "close"
        | "locale"
        | "zIndex"
        | "cookies"
        | "conversationFields"
        | "conversationTags",
      param?:
        | ((...args: any[]) => void)
        | string
        | number
        | { id: string; value: string | number | boolean }[]
        | string[],
    ) => void;
  }
}

export {};
