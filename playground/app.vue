<template>
  <div>
    NuAuth Playground:

    <p>Token: {{ token }}</p>

    <button @click="login()">
      Login
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
} = useNuAuth()

if (!token.value) await login()
</script>
