import React from 'react';
import { PolicyLayout } from '@/components/governance/PolicyLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal Scope | APASIFIC Press',
  description: 'Aim, Scope, and publication details for APASIFIC journals.',
};

export default function JournalScopePage() {
  return (
    <PolicyLayout title="Journal Aim & Scope">
      <p>
        Setiap periodik jurnal di bawah naungan APASIFIC Press berfokus pada diseminasi hasil penelitian berkualitas tinggi untuk memfasilitasi dialog ilmiah di wilayah Asia Pasifik dan internasional.
      </p>

      <h3>1. Aim & Scope</h3>
      <p>
        Tujuan utama kami adalah mempublikasikan kontribusi riset teoretis dan terapan yang orisinal, inovatif, serta memiliki dampak nyata terhadap pengembangan ilmu pengetahuan, teknologi, kebijakan publik, dan kemasyarakatan.
      </p>

      <h3>2. Bidang Keilmuan (Subject Areas)</h3>
      <p>
        Jurnal kami mencakup berbagai disiplin ilmu utama, termasuk:
      </p>
      <ul>
        <li>Akuntansi, Audit, dan Perpajakan</li>
        <li>Administrasi Bisnis, Keuangan, dan Manajemen</li>
        <li>Ekonomi Pembangunan dan Kebijakan Publik</li>
        <li>Teknologi Informasi, Ilmu Komputer, dan Sistem Cerdas</li>
        <li>Pengabdian Kepada Masyarakat (Sains Terapan dan Sosial)</li>
      </ul>

      <h3>3. Jenis Artikel (Article Types)</h3>
      <p>
        Kami menerima naskah berupa:
      </p>
      <ul>
        <li><strong>Original Research Article:</strong> Artikel hasil penelitian empiris orisinal.</li>
        <li><strong>Review Article:</strong> Analisis literatur komprehensif (meta-analisis/systematic review).</li>
        <li><strong>Technical Paper:</strong> Laporan teknis pengembangan sistem/algoritma baru.</li>
      </ul>

      <h3>4. Bahasa Pengantar (Language)</h3>
      <p>
        Bahasa resmi publikasi adalah <strong>Bahasa Inggris (English)</strong> dan <strong>Bahasa Indonesia</strong>. Setiap naskah wajib menyertakan judul dan abstrak bahasa Inggris yang akurat untuk indeksasi global.
      </p>

      <h3>5. Frekuensi Terbit (Frequency)</h3>
      <p>
        Jurnal diterbitkan secara berkala 4 kali dalam setahun (<strong>Quarterly</strong>) pada setiap akhir kuartal tahun berjalan.
      </p>
    </PolicyLayout>
  );
}
