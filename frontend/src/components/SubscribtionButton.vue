<script setup lang="ts">
import { state, subscribed } from '~stores/state'
import { addSubscription, removeSubscription } from '~stores/subscription'
import { useStore } from '@nanostores/vue'
import { fetchBirthdayNotificationServer } from '~utils/backend'
import {
  checkWebpushCompability,
  askNotificationPermission,
  generateSubscriptionPayload,
} from '~utils/webpush'

const $state = $(useStore(state))
const $subscribed = $(useStore(subscribed))

const subscribe = async () => {
  state.setKey('disableInteraction', true)

  try {
    if ($state.selected === undefined) {
      throw new Error('You have not selected a target.')
    }

    checkWebpushCompability()
    const permission = await askNotificationPermission()
    if (permission !== 'granted') {
      throw new Error('Unable to get notification permission.')
    }

    const payload = await generateSubscriptionPayload(
      $state.selected,
      $state.timeZone
    )
    const response = await fetchBirthdayNotificationServer('subscribe', {
      body: JSON.stringify(payload),
      method: 'POST',
    })

    const text = await response.text()
    if (response.status === 201 && text.includes('SUBSCRIBED')) {
      addSubscription($state.selected)
      alert('Successfully subscribed.')
    } else {
      throw new Error(text)
    }
  } catch (error) {
    alert(error)
  } finally {
    state.setKey('disableInteraction', false)
  }
}

const unsubscribe = async () => {
  state.setKey('disableInteraction', true)

  try {
    if ($state.selected === undefined) {
      throw new Error('You have not selected a target.')
    }

    if ($subscribed) {
      const payload = await generateSubscriptionPayload(
        $state.selected,
        $state.timeZone
      )
      const response = await fetchBirthdayNotificationServer('unsubscribe', {
        body: JSON.stringify(payload),
        method: 'POST',
      })

      const text = await response.text()
      if (response.status === 200 && text.includes('UNSUBSCRIBED')) {
        removeSubscription($state.selected)
        alert('Successfully unsubscribed.')
      } else {
        throw new Error(text)
      }
    }
  } catch (error) {
    alert(error)
  } finally {
    state.setKey('disableInteraction', false)
  }
}
</script>

<template>
  <div class="subscription-button-container">
    <button
      @click="subscribe"
      :disabled="$subscribed || $state.disableInteraction"
    >
      Subscribe
    </button>
    <button
      @click="unsubscribe"
      :disabled="!$subscribed || $state.disableInteraction"
    >
      Unsubscribe
    </button>
  </div>
</template>

<style scoped>
.subscription-button-container {
  width: 100%;
  display: flex;
  justify-content: space-evenly;
}

.subscription-button-container > button {
  background-color: var(--t-bg-color-alt);
  color: inherit;
  border: 1px solid currentColor;
  padding: 6px 8px;
}

.subscription-button-container > button:not([disabled]) {
  cursor: pointer;
}

.subscription-button-container > button:disabled {
  filter: opacity(0.7);
}
</style>
