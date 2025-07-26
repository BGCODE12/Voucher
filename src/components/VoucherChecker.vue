<template>
  <v-card class="voucher-page-card full-page-card" :style="`min-height: 100dvh; width: 100vw; max-width: 600px; box-shadow: var(--card-shadow); border-radius: var(--page-radius); padding: 32px 0; display: flex; flex-direction: column; justify-content: flex-start; align-items: center;`">
    <v-card-title class="voucher-page-title">فحص القسيمة</v-card-title>
    <v-card-text class="voucher-card-content">
      <v-text-field
        v-model="voucherCode"
        label="أدخل رقم القسيمة أو امسح الكود"
        outlined
        dense
        class="voucher-page-input"
        @keyup.enter="checkVoucher"
        variant="solo"
        style="width: 100%;"
      />
      <transition name="fade-slide">
        <v-btn v-if="true" color="primary" block class="voucher-page-btn" style="width: 100%; margin-top: 12px;" @click="showScanner = !showScanner">
          <span v-if="!showScanner">مسح QR</span>
          <span v-else>إغلاق الماسح</span>
        </v-btn>
      </transition>
      <div v-if="showScanner" class="mb-3" style="display: flex; justify-content: center;">
        <div id="qr-reader" style="width: 100%"></div>
      </div>
      <transition name="fade-slide">
        <v-btn v-if="true" color="success" block class="voucher-page-btn" style="width: 100%; margin-top: 12px;" @click="checkVoucher" :disabled="!voucherCode">
          فحص القسيمة
        </v-btn>
      </transition>
      <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="2000" top>
        {{ snackbarMsg }}
      </v-snackbar>
      <div class="voucher-page-result">
        <v-alert
          v-if="result.status"
          :type="result.status === 'valid' ? 'success' : (result.status === 'used' ? 'warning' : 'error')"
          class="mt-4 mobile-alert improved-alert"
          border="start"
          elevation="2"
        >
          <template v-if="result.status === 'valid'">
            ✅ القسيمة صالحة ولم تُستخدم بعد
            <v-btn color="primary" class="ml-2 voucher-page-btn" @click="useVoucher">استخدم القسيمة</v-btn>
          </template>
          <template v-else-if="result.status === 'used'">
            ❌ هذه القسيمة استخدمت سابقًا
          </template>
          <template v-else>
            ⚠️ القسيمة غير موجودة
          </template>
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { Html5Qrcode } from 'html5-qrcode';

const voucherCode = ref('');
const showScanner = ref(false);
const result = ref({ status: null });
const snackbar = ref(false);
const snackbarMsg = ref('');
const snackbarColor = ref('success');

// فحص القسيمة
function checkVoucher() {
  if (!voucherCode.value) return;
  const vouchers = JSON.parse(localStorage.getItem('vouchers') || '[]');
  const found = vouchers.find(v => v.code === voucherCode.value);
  if (!found) {
    result.value = { status: 'notfound' };
    snackbarMsg.value = 'القسيمة غير موجودة';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } else if (found.status === 'used') {
    result.value = { status: 'used', voucher: found };
    snackbarMsg.value = 'هذه القسيمة استخدمت سابقًا';
    snackbarColor.value = 'warning';
    snackbar.value = true;
  } else {
    result.value = { status: 'valid', voucher: found };
    snackbarMsg.value = 'القسيمة صالحة ولم تُستخدم بعد';
    snackbarColor.value = 'success';
    snackbar.value = true;
  }
}

// تحديث حالة القسيمة
function useVoucher() {
  const vouchers = JSON.parse(localStorage.getItem('vouchers') || '[]');
  const idx = vouchers.findIndex(v => v.code === voucherCode.value);
  if (idx !== -1) {
    vouchers[idx].status = 'used';
    vouchers[idx].usedAt = new Date().toISOString();
    localStorage.setItem('vouchers', JSON.stringify(vouchers));
    result.value = { status: 'used', voucher: vouchers[idx] };
    snackbarMsg.value = 'تم استخدام القسيمة بنجاح';
    snackbarColor.value = 'success';
    snackbar.value = true;
  }
}

let html5QrCodeInstance = null;

function stopScanner() {
  if (html5QrCodeInstance) {
    html5QrCodeInstance.stop().catch(() => {});
    html5QrCodeInstance.clear().catch(() => {});
    html5QrCodeInstance = null;
  }
  const el = document.getElementById('qr-reader');
  if (el) el.innerHTML = '';
}

watch(
  showScanner,
  async (val) => {
    if (val) {
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));
      stopScanner();
      html5QrCodeInstance = new Html5Qrcode('qr-reader');
      try {
        await html5QrCodeInstance.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 200 },
          (decodedText) => {
            voucherCode.value = decodedText;
            showScanner.value = false;
            checkVoucher();
            stopScanner();
          },
          () => {}
        );
      } catch (e) {
        console.error('خطأ أثناء تهيئة الكاميرا:', e);
      }
    } else {
      stopScanner();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  stopScanner();
});
</script>

<style scoped>
.voucher-page-card {
  box-shadow: var(--card-shadow);
  border-radius: var(--page-radius);
  padding-bottom: var(--page-margin-bottom);
}
.voucher-page-title {
  color: #7c3aed;
  font-size: var(--title-size);
  font-family: 'Tajawal', 'Cairo', Arial, sans-serif;
  font-weight: bold;
  margin-bottom: 24px;
  letter-spacing: 0.5px;
  text-align: center;
}
.voucher-page-input {
  font-size: var(--input-size);
  border-radius: var(--input-radius);
  margin-bottom: 24px;
}
.voucher-page-btn {
  font-size: var(--btn-size);
  min-height: var(--btn-min-height);
  border-radius: var(--btn-radius);
  font-weight: bold;
  background: linear-gradient(90deg, #7c3aed 0%, #67e8f9 100%) !important;
  color: #fff !important;
  box-shadow: 0 2px 8px #7c3aed22;
}
.voucher-page-btn:hover {
  background: linear-gradient(90deg, #6d28d9 0%, #38bdf8 100%) !important;
}
.voucher-page-result {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.voucher-card-content {
  width: 100%;
  box-sizing: border-box;
  padding-left: 16px;
  padding-right: 16px;
}
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style> 