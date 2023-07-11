# NuAuth

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

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
  modules: ['@privyid/nuauth'],
  build  : { transpile: ['@privyid/nuauth'] },
})
```

## Usage

```ts
import { useNuAuth } from '@privyid/nuauth/core'

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
logout('/dashboard')

// Check token is almost expired (15 minutes before Expired Date)
if (isAlmostExpired(15)) {
  // Request new token
  await refresh()
}
```

## Configuration

This module read enviroment variables directly.

| Env Name                 | Default          | Description                                                                           |
|--------------------------|------------------|---------------------------------------------------------------------------------------|
| OAUTH_HOST               | -                | **(Required)** Oauth server's host                                                    |
| OAUTH_CLIENT_ID          | -                | **(Required)** Oauth Client ID                                                        |
| OAUTH_CLIENT_SECRET      | -                | **(Required)** Oauth Client Secret                                                    |
| OAUTH_REDIRECT_URI       | `/auth/callback` | Oauth Callback URI                                                     |
| OAUTH_SCOPE              | `public read`    | Oauth scope                                                                           |
| OAUTH_LOGOUT_URI         | -                | Oauth Logout URI                                                                      |
| OAUTH_HOME               | `/`              | Redirect path after success login                                                     |
| OAUTH_REGISTER           | `false`          | Add params register to Oauth Server                                                   |
| OAUTH_REDIRECT_WHITELIST | -                | Redirect path after success login whitelist, for multiple value, use `;` as delimeter |

👉 See [.env.example](/.env.example) for example

## Cookie Serialize Config

You can change default cookie config. Add this in your `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  // ...
  nuauth : {
    // ...
    cookie: {
      httpOnly: true,
      sameSite: 'none',
      path    : '/',
      secure  : true,
    },
    // ...
  }
})
```

👉 See [here](https://github.com/jshttp/cookie#options-1) for all cookie options.

## Multiple Server Profile

Since `0.4.0`, you can target more than one oauth server.

1. Add new profile in your `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  // ...
  nuauth: {
    // ...
    profile: {
      default: 'oauth',
      names  : [
        'oauth',  // default profile
        'github', // additional profile
      ]
    }
    // ...
  }
})
```

2. Your profile's name will become prefix on [config env](#configuration). ex: If your profile's name `github`, your env will became:
   - `GITHUB_HOST`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`,
   - `GITHUB_REDIRECT_URI`
   - etc.

3. In your component, explicit the profile you want to use.

```ts
import { useNuAuth } from '@privyid/nuauth/core'

const {
  token,
  isAlmostExpired,
  login,
  logout,
  refresh,
} = useNuAuth('github')
```

## Contribution

- Clone this repository
- Play [Nyan Cat](https://www.youtube.com/watch?v=QH2-TGUlwu4) in the background (really important!)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Run `yarn install`
- Run `yarn dev:prepare` to generate type stubs.
- Use `yarn dev` to start [playground](./playground) in development mode.

## License

[MIT License](/LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@privyid/nuauth/latest.svg?style=for-the-badge&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@privyid/nuauth

[npm-downloads-src]: https://img.shields.io/npm/dm/@privyid/nuauth.svg?style=for-the-badge&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@privyid/nuauth

[license-src]: https://img.shields.io/npm/l/@privyid/nuauth.svg?style=for-the-badge&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@privyid/nuauth

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?style=for-the-badge&logo=nuxt.js
[nuxt-href]: https://nuxt.com
