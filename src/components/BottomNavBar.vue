<template>
  <v-bottom-navigation
    app
    grow
    class="mobile-nav"
    color="#ffffffcc"
    active-color="#7c3aed"
    style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; backdrop-filter: blur(12px);"
  >
    <v-btn :to="{ name: 'generate' }" :active="$route.name === 'generate'" icon>
      <v-icon>mdi-plus-box</v-icon>
      <span class="nav-label">توليد قسيمة</span>
    </v-btn>
    <v-btn :to="{ name: 'check' }" :active="$route.name === 'check'" icon>
      <v-icon>mdi-qrcode-scan</v-icon>
      <span class="nav-label">فحص قسيمة</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup>
import { useRoute } from 'vue-router';
const $route = useRoute();
</script>

<style scoped>
.mobile-nav {
  border-top: 1.5px solid #e0e0e0;
  box-shadow: 0 -2px 16px #b39ddb33;
  height: 60px;
  padding-bottom: env(safe-area-inset-bottom);
  background: #ffffffcc !important;
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
  color: #fff;
  font-weight: bold;
  opacity: 1;
}
.v-btn--active .v-icon {
  color: #fff !important;
  background: #7c3aed;
  border-radius: 50%;
  padding: 6px;
  box-shadow: 0 2px 8px #7c3aed33;
}
.v-btn .v-icon {
  color: #7c3aed !important;
  opacity: 0.7;
  background: #ede7f6;
  border-radius: 50%;
  padding: 6px;
}
</style> 