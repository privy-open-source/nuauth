<template>
  <div>
    <h1>NuAuth Playground</h1>

    <p><b>Token</b>: {{ token }}</p>

    <button @click="login()">
      Login
    </button>
    <button @click="refresh()">
      Refresh
    </button>
    <button @click="logout()">
      Logout
    </button>

    <p><b>Gitlab Token</b>: {{ glToken }}</p>

    <button @click="glLogin()">
      Login
    </button>
    <button @click="glRefresh()">
      Refresh
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useNuAuth } from '@privyid/nuauth/core'

const {
  login,
  logout,
  token,
  refresh,
} = useNuAuth()

const {
  login: glLogin,
  token: glToken,
  refresh: glRefresh,
} = useNuAuth('gitlab')
</script>
