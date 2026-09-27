<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LogoutView',

  beforeCreate() {
    this.$store.dispatch('user/logout');
    this.$router.push('/');
  }

});
</script>