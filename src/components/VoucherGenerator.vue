<template>
  <v-card
    class="voucher-page-card full-page-card"
    :style="`min-height: 100dvh; width: 100vw; max-width: 600px; box-shadow: var(--card-shadow); border-radius: var(--page-radius); padding: 32px 0; display: flex; flex-direction: column; justify-content: flex-start; align-items: center;`"
  >
    <v-card-title class="voucher-page-title">توليد قسيمة جديدة</v-card-title>

    <v-card-text class="voucher-card-content">
      <v-text-field
        v-model="customerName"
        label="اسم الزبون (اختياري)"
        outlined
        dense
        class="voucher-page-input"
        variant="solo"
        style="width: 100%;"
      />

      <v-btn color="primary" block class="voucher-page-btn" style="width: 100%;" @click="generateVoucher">
        توليد القسيمة
      </v-btn>

      <v-snackbar v-model="snackbar" color="success" :timeout="2000" top>
        تم توليد القسيمة بنجاح!
      </v-snackbar>

      <div v-if="voucher" class="voucher-page-result">
        <div class="voucher-image-wrapper" id="voucher-pdf-content">
          <img src="C:/Users/RYADAH4/voucher-app/src/assets/voucher-template.png" class="voucher-bg" />
          <div class="qr-overlay">
            <qrcode-vue :value="voucher.code" :size="50" />
          </div>
        </div>

        <!-- ✅ زر التصدير -->
        <v-btn color="secondary" class="mt-2 voucher-page-btn" block @click="exportImage">
          تصدير صورة
        </v-btn>

        <!-- ✅ زر المشاركة -->
        <v-btn color="success" class="mt-2 voucher-page-btn" block @click="sharePDF">
          مشاركة القسيمة
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import QrcodeVue from 'qrcode.vue';
import html2canvas from 'html2canvas';
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDUmp3K-XKd0-hKj1oE_9ndE0nDWsawiZI",
  authDomain: "voicherscanner.firebaseapp.com",
  projectId: "voicherscanner",
  storageBucket: "voicherscanner.appspot.com",
  messagingSenderId: "542304627737",
  appId: "1:542304627737:web:a08dbf028310cccbc18e88"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// الحالة
const customerName = ref('');
const voucher = ref(null);
const snackbar = ref(false);

// توليد UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// توليد قسيمة
async function generateVoucher() {
  const code = generateUUID();
  const issuedAt = new Date().toISOString();
  const newVoucher = {
    code,
    issuedAt,
    status: 'unused',
    customerName: customerName.value,
    usedAt: null,
  };

  await addDoc(collection(db, "vouchers"), newVoucher);

  voucher.value = newVoucher;
  customerName.value = '';
  snackbar.value = true;
}

// ✅ دالة تصدير صورة PNG
async function exportImage() {
  const element = document.getElementById('voucher-pdf-content');
  const canvas = await html2canvas(element, { scale: 3, useCORS: true });
  const image = canvas.toDataURL("image/png");

  const link = document.createElement('a');
  link.href = image;
  link.download = `voucher-${voucher.value.code}.png`;
  link.click();
}

// ✅ دالة مشاركة صورة
async function shareImage() {
  if (!navigator.share || !navigator.canShare) {
    alert("جهازك لا يدعم مشاركة الصور.");
    return;
  }

  const element = document.getElementById('voucher-pdf-content');
  const canvas = await html2canvas(element, { scale: 3, useCORS: true });

  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  const file = new File([blob], `voucher-${voucher.value.code}.png`, { type: "image/png" });

  try {
    await navigator.share({
      title: "قسيمة ضيافة أبعاد",
      text: "استخدم هذه القسيمة عند زيارتك.",
      files: [file],
    });
  } catch (e) {
    alert('فشل في مشاركة الصورة: ' + e.message);
  }
}
</script>


<style scoped>
.voucher-page-title {
  color: #7c3aed;
  font-size: var(--title-size);
  font-family: 'Tajawal', 'Cairo', Arial, sans-serif;
  font-weight: bold;
  margin-bottom: 24px;
  letter-spacing: 0.5px;
  text-align: center;
}

.voucher-card-content {
  width: 100%;
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

.voucher-image-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.voucher-bg {
  width: 100%;
  border-radius: 16px;
  display: block;
}

.qr-overlay {
  position: absolute;
  top: 40px;
  left: 20px;
}
</style>
