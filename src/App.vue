<template>
  <v-app class="app-root">
    <v-main class="main-content">
      <router-view />
    </v-main>
    <BottomNavBar />
  </v-app>
</template>

<script setup>
import { useRoute } from 'vue-router';
import BottomNavBar from './components/BottomNavBar.vue';
const $route = useRoute();
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  width: 100%;
  
  overflow-x: hidden;
}
.main-content {
  min-height: calc(100vh - 60px);
  width: 100vw;
  background: transparent;
  padding-bottom: 80px; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.mobile-nav {
  border-top: 1.5px solid #e0e0e0;
  
  height: 60px;
  padding-bottom: env(safe-area-inset-bottom);
  
  backdrop-filter: blur(12px);
}
.nav-label {
  display: block;
  font-size: 0.95rem;
  margin-top: 2px;
  color: #7c3aed;
  opacity: 0.8;
  font-family: 'Tajawal', 'Cairo', Arial, sans-serif;
}
.v-btn--active .nav-label {
  color: #6e1515;
  font-weight: bold;
  opacity: 1;
}
.v-btn--active .v-icon {
 
  background: #7c3aed;
  border-radius: 50%;
  padding: 6px;
  box-shadow: 0 2px 8px #7c3aed33;
}
.v-btn .v-icon {
  
  opacity: 0.7;
 
  border-radius: 50%;
  padding: 6px;
}
</style>