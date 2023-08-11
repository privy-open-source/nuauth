<template>
  <div style="display: flex;">
    <iframe
      src="http://localhost:3000"
      width="100%"
      height="500px" />
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'

definePageMeta({ auth: false })
</script>
