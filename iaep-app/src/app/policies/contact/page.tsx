import React from 'react';
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Editorial Office | APASIFIC Press',
  description: 'Official contact information and address of the IAEP Jurnal Editorial Office.',
};

export default function ContactEditorialOfficePage() {
  return (
    <PolicyLayout title="Contact Editorial Office">
      <p>
        Jika Anda memiliki pertanyaan mengenai proses penyerahan naskah, kerja sama penerbitan, atau kendala teknis sistem, silakan hubungi Kantor Redaksi kami melalui detail berikut:
      </p>

      <h3>1. Kantor Redaksi (Editorial Office)</h3>
      <p>
        <strong>IAEP Jurnal Jaringan APASIFIC</strong><br />
        Dikelola oleh Association of Asia Pacific Academician.
      </p>

      <h3>2. Entitas Penerbit (Publisher)</h3>
      <p>
        <strong>PT. Bernas Sumut Jaya</strong><br />
        AHU Number: 003707.AH.01.30.Tahun 2024
      </p>

      <h3>3. Alamat Kantor (Office Address)</h3>
      <p>
        Jl. Setia Budi No. 123, Komplek Bernas Building,<br />
        Kota Medan, Sumatera Utara, 20132,<br />
        Indonesia.
      </p>

      <h3>4. Hubungi Kami (Direct Communication)</h3>
      <ul>
        <li><strong>Email Resmi:</strong> admin@apasific.com</li>
        <li><strong>Pertanyaan Editorial:</strong> editor@apasific.com</li>
        <li><strong>Layanan WhatsApp Dukungan:</strong> +62 812-3456-7890 (Hanya pesan teks)</li>
      </ul>

      <h3>5. Jam Kerja (Working Hours)</h3>
      <p>
        Senin – Jumat: 09:00 – 17:00 WIB (Waktu Indonesia Barat).<br />
        Sabtu, Minggu & Hari Libur Nasional: Tutup.
      </p>
    </PolicyLayout>
  );
}
