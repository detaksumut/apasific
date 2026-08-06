import React from 'react';
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'APC Policy | APASIFIC Press',
  description: 'Article Processing Charge (APC) policy for APASIFIC Press.',
};

export default function ApcPolicyPage() {
  return (
    <PolicyLayout title="Article Processing Charge (APC) Policy">
      <p>
        APASIFIC Press berkomitmen untuk menyebarkan ilmu pengetahuan secara global tanpa hambatan finansial. Kebijakan biaya publikasi kami transparan untuk mendukung model akses terbuka (*Open Access*) seutuhnya.
      </p>

      <h3>1. Submission Fee (Biaya Pengajuan Naskah)</h3>
      <p>
        <strong>Rp 0 (Gratis).</strong> Kami tidak memungut biaya apa pun saat penulis mengirimkan naskah (*submission*) ke sistem jurnal kami.
      </p>

      <h3>2. Editorial & Review Fee (Biaya Peninjauan)</h3>
      <p>
        <strong>Rp 0 (Gratis).</strong> Seluruh proses peninjauan sejawat (*peer review*) oleh reviewer ahli dan pengelolaan editorial oleh dewan redaksi dijalankan bebas biaya.
      </p>

      <h3>3. Publication Fee / Article Processing Charge (Biaya Publikasi)</h3>
      <p>
        <strong>Rp 0 (Gratis).</strong> Kami tidak membebankan biaya penerbitan atau pengolahan artikel (*Article Processing Charge*) kepada penulis atau institusinya setelah naskah dinyatakan diterima (*Accepted*).
      </p>

      <h3>4. Kebijakan Keringanan (Waiver Policy)</h3>
      <p>
        Karena seluruh proses publikasi di bawah naungan APASIFIC Press tidak dipungut biaya (*free of charge*), sistem keringanan biaya publikasi (*waiver policy*) tidak diperlukan.
      </p>
    </PolicyLayout>
  );
}
