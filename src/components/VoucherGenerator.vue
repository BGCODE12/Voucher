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
        <div class="styled-voucher" id="voucher-pdf-content">
          <div class="voucher-left">
            <qrcode-vue :value="voucher.code" :size="90" />
          </div>
          <div class="voucher-right">
            <div class="voucher-heading">ضيافة أبعاد</div>
            <div class="voucher-text">
              إنَّ حامل هذا الكوبون ضيفٌ كريم لدى إدارة الفريق، لذا توجّه الإدارة كافة كوادر الضيافة لتقديم أرقى مستويات الخدمة والعناية، بما يليق بمقامه الكريم
            </div>
            <div class="voucher-code-text">رمز القسيمة: {{ voucher.code }}</div>
            <div class="voucher-date">تاريخ الإصدار: {{ formatDate(voucher.issuedAt) }}</div>
            <div class="voucher-customer" v-if="voucher.customerName">اسم الزبون: {{ voucher.customerName }}</div>
          </div>
        </div>

        <v-btn color="secondary" class="mt-2 voucher-page-btn" block @click="exportPDF">تصدير PDF</v-btn>
        <v-btn color="success" class="mt-2 voucher-page-btn" block @click="sharePDF">مشاركة القسيمة</v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import QrcodeVue from 'qrcode.vue';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Firebase Config
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

const customerName = ref('');
const voucher = ref(null);
const snackbar = ref(false);

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

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

async function exportPDF(isShare = false) {
  if (!voucher.value) {
    alert('يرجى توليد قسيمة أولاً');
    return;
  }
  
  // Select the voucher DOM element
  const voucherElement = document.getElementById('voucher-pdf-content');
  if (!voucherElement) {
    alert('لم يتم العثور على محتوى القسيمة.');
    return;
  }

  // Use html2canvas to capture the voucher as image
  const canvas = await html2canvas(voucherElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    scrollY: -window.scrollY,
  });
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF({
    unit: 'pt',
    format: 'a4',
    orientation: 'portrait',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Calculate image dimensions to fit inside PDF page
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pageWidth - 80; // margins: 40 left + 40 right
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  // Add image to PDF (centered horizontally)
  pdf.addImage(imgData, 'PNG', 40, 60, pdfWidth, pdfHeight);

  if (isShare && navigator.canShare && navigator.canShare({ files: [] })) {
    try {
      // Convert PDF to Blob
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `voucher-${voucher.value.code}.pdf`, {
        type: 'application/pdf',
      });

      await navigator.share({
        title: 'قسيمة ضيافة أبعاد',
        text: 'قسيمتك جاهزة!',
        files: [file],
      });
    } catch (e) {
      alert('فشل في مشاركة الملف: ' + e.message);
    }
  } else {
    pdf.save(`voucher-${voucher.value.code}.pdf`);
  }
}

function sharePDF() {
  if (!navigator.share || !navigator.canShare) {
    alert("جهازك لا يدعم مشاركة الملفات.");
    return;
  }
  exportPDF(true);
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
.styled-voucher {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #f0f0f0;
  padding: 16px;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  height: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font-family: 'Tajawal', 'Cairo', sans-serif;
  box-sizing: border-box;
  direction: rtl;
  text-align: right;
}
.voucher-left {
  flex: 0 0 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
}
.voucher-right {
  flex: 1;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.voucher-heading {
  font-size: 16px;
  font-weight: bold;
  color: #6d28d9;
  margin-bottom: 8px;
}
.voucher-text {
  font-size: 12px;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.6;
}
.voucher-code-text,
.voucher-date,
.voucher-customer {
  font-size: 13px;
  color: #555;
  margin-bottom: 6px;
}
</style>
