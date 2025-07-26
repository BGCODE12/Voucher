<template>
  <v-card class="voucher-page-card full-page-card" :style="`min-height: 100dvh; width: 100vw; max-width: 600px; box-shadow: var(--card-shadow); border-radius: var(--page-radius); padding: 32px 0; display: flex; flex-direction: column; justify-content: flex-start; align-items: center;`">
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
        <div id="voucher-pdf-content" class="voucher-preview mobile-voucher-preview voucher-page-preview">
          <div class="voucher-title">Discount Voucher</div>
          <div class="voucher-row"><span>Code:</span> <span class="voucher-code">{{ voucher.code }}</span></div>
          <div v-if="voucher.customerName" class="voucher-row"><span>Customer:</span> <span>{{ voucher.customerName }}</span></div>
          <div class="voucher-row"><span>Issued At:</span> <span>{{ formatDate(voucher.issuedAt) }}</span></div>
          <div class="voucher-qr">
            <qrcode-vue :value="voucher.code" :size="100" />
          </div>
          <div class="voucher-note">Please present this voucher at payment</div>
        </div>
        <v-btn color="secondary" class="mt-2 voucher-page-btn" block @click="exportPDF">تصدير PDF</v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import QrcodeVue from 'qrcode.vue';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Filesystem, Directory } from '@capacitor/filesystem';

const customerName = ref('');
const voucher = ref(null);
const snackbar = ref(false); // لإظهار رسالة النجاح

// توليد UUID عشوائي
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatDate(date) {
  return new Date(date).toLocaleString('en-GB');
}

// توليد القسيمة وحفظها
function generateVoucher() {
  const code = generateUUID();
  const issuedAt = new Date().toISOString();
  const newVoucher = {
    code,
    issuedAt,
    status: 'unused',
    customerName: customerName.value,
    usedAt: null,
  };
  const vouchers = JSON.parse(localStorage.getItem('vouchers') || '[]');
  vouchers.push(newVoucher);
  localStorage.setItem('vouchers', JSON.stringify(vouchers));
  voucher.value = newVoucher;
  customerName.value = '';
  snackbar.value = true; // إظهار رسالة النجاح
}

// تصدير القسيمة PDF
async function exportPDF() {
  const element = document.getElementById('voucher-pdf-content');
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = 180;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  const x = (210 - pdfWidth) / 2;
  const y = 40;
  pdf.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);
  const pdfOutput = pdf.output('arraybuffer');
  const base64 = btoa(
    new Uint8Array(pdfOutput)
      .reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  await Filesystem.writeFile({
    path: `voucher-${voucher.value.code}.pdf`,
    data: base64,
    directory: Directory.Documents,
  });
  alert('PDF saved to Documents folder!');
}
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
.voucher-page-preview {
  box-shadow: 0 2px 16px #b39ddb33, 0 1px 4px #7c3aed11;
  border-radius: 20px;
  margin-bottom: 18px;
}
.voucher-card-content {
  width: 100%;
  box-sizing: border-box;
  padding-left: 16px;
  padding-right: 16px;
}
</style> 