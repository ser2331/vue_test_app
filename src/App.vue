<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container class="no-padding">
      <q-page class="no-padding">
        <AccountForm/>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import AccountForm from './components/AccountForm.vue';
</script>

<style scoped>
.no-padding {
  padding: 0 !important;
  margin: 0 !important;
}

.q-page-container, .q-page, .q-layout {
  padding: 0 !important;
  margin: 0 !important;
}
</style>