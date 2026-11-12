<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()
const auth = useAuthStore()

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    await router.push('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login">
    <form class="card" @submit.prevent="onSubmit">
      <h1>SnapShare admin</h1>
      <label>
        Email
        <input v-model="email" type="email" name="email" autocomplete="username" required />
      </label>
      <label>
        Password
        <input v-model="password" type="password" name="password" autocomplete="current-password" required />
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="loading">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
    </form>
  </main>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 20rem;
  padding: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

input,
button {
  font: inherit;
  padding: 0.4rem 0.5rem;
}

.error {
  margin: 0;
  color: #b00020;
}
</style>
