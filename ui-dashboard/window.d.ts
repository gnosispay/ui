interface Window {
  dataLayer: {
    push: (...args: any[]) => void;
    find: (...args: any[]) => any;
  };
  gtmCustomScriptsLoaded?: boolean;
  deBridge?: {
    widget: (config: any) => void;
  };
}
