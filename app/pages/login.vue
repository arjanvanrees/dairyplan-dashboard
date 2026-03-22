<template>
  <div class="flex flex-col items-center justify-center w-full gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Inloggen"
        description="Vul je emailadres in om met een Magic Link in te loggen."
        icon="i-lucide-user"
        :fields="fields"
        :submit="{
          label: 'Doorgaan'
        }"
        @submit="onSubmit"
      />
    </UPageCard>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()
const config = useRuntimeConfig()

definePageMeta({
  layout: 'login'
})

watchEffect(() => {
  if (user.value) {
    return navigateTo('/')
  }
})

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'E-mailadres',
  placeholder: 'Vul je emailadres in',
  required: true
}]

const schema = z.object({
  email: z.email('Ongeldig e-mailadres')
})

const displayError = (error: { message: string }) => {
  toast.add({
    title: 'Fout',
    description: error.message,
    icon: 'i-lucide-alert-circle',
    color: 'error'
  })
}

const displaySuccess = (message: string) => {
  toast.add({
    title: 'Succes',
    description: message,
    icon: 'i-lucide-check-circle',
    color: 'success'
  })
}

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { error } = await supabase.auth.signInWithOtp({
    email: payload.data.email,
    options: {
      emailRedirectTo: `${config.public.baseURL}/confirm`
    }
  })
  if (!error) displaySuccess('Check je email voor de inloglink.')
  if (error) displayError(error)
}

useHead({
  title: 'Inloggen - DairyPlan Dashboard'
})
</script>
