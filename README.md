# NuAuth

> Oauth2 Client for Nuxt

## Compabilities

- Nuxt 3

## Instalation

```
yarn add --dev @privyid/nuauth
```

Then, add into `nuxt.config.ts` modules

```ts
export default defineNuxtConfig({
  modules: ['@privyid/nuauth/module'],
  build: {
    transpile: ['@privyid/nuauth']
  }
})
```

## Usage

```ts
import { useNuAuth } from '@privyid/nuauth'

const {
  token,
  isAlmostExpired,
  login,
  logout,
  refresh,
} = useNuAuth()

// Get Access-Token
token.value

// Redirect to login page
login()

// Redirect to login page, and redirect to /dashboard after success
login('/dashboard')

// Redirect to logout page
logout()

// Redirect to logout page, and redirect to /dashboard after success re-login
login('/dashboard')

// Check token is almost expired (15 minutes before Expired Date)
if (isAlmostExpired(15)) {
  // Request new token
  await refresh()
}
```

## Configuration

This module has no configuration, instead this module read enviroment variables directly.

| Env Name                 | Default       | Description                                                                           |
|--------------------------|---------------|---------------------------------------------------------------------------------------|
| OAUTH_HOST               | -             | **(Required)** Oauth server's host                                                    |
| OAUTH_CLIENT_ID          | -             | **(Required)** Oauth Client ID                                                        |
| OAUTH_CLIENT_SECRET      | -             | **(Required)** Oauth Client Secret                                                    |
| OAUTH_REDIRECT_URI       | -             | **(Required)** Oauth Callback URI                                                     |
| OAUTH_SCOPE              | `public read` | Oauth scope                                                                           |
| OAUTH_LOGOUT_URI         | -             | Oauth Logout URI                                                                      |
| OAUTH_HOME               | `/`           | Redirect path after success login                                                     |
| OAUTH_REGISTER           | `false`       | Add params register to Oauth Server                                                   |
| OAUTH_REDIRECT_WHITELIST | -             | Redirect path after success login whitelist, for multiple value, use `;` as delimeter |

See [.env.example](/.env.example) for example

## Contribution

- Clone this repository
- Play [Nyan Cat](https://www.youtube.com/watch?v=QH2-TGUlwu4) in the background (really important!)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Run `yarn install`
- Run `yarn dev:prepare` to generate type stubs.
- Use `yarn dev` to start [playground](./playground) in development mode.

## License

[MIT License](/LICENSE)
