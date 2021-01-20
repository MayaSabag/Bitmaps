<template>
  <v-app>
    <v-main>
      <WelcomePage />
    </v-main>
  </v-app>
</template>

<script>
import WelcomePage from './components/WelcomePage';

export default {
  name: 'App',

  components: {
    WelcomePage
  },
};
</script>
