// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly OAUTH_HOST: string,
  readonly OAUTH_CLIENT_ID: string,
  readonly OAUTH_CLIENT_SECRET: string,
  readonly OAUTH_SCOPE: string,
  readonly OAUTH_REDIRECT_URI: string,
  readonly OAUTH_REDIRECT_WHITELIST: string,
  readonly OAUTH_HOME: string,
  readonly OAUTH_REGISTER: 'true' | 'false',
  readonly OAUTH_LOGOUT_URI: string,
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv,
}
