/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly SSR: boolean;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
