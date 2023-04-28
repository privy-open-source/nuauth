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
  </div>
</template>

<script lang="ts" setup>
import { useNuAuth } from '@privyid/nuauth'

const {
  login,
  logout,
  token,
  refresh,
} = useNuAuth()
</script>
