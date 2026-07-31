-- Migration 3.5: Upgrade Exam Session Status Machine
-- Menambahkan status baru sesuai Certification Lifecycle governance
--
-- Urutan status resmi:
-- DRAFT → READY → IN_PROGRESS → SUBMITTED → UNDER_REVIEW → ASSESSMENT_COMPLETED → CERTIFIED | FAILED | EXPIRED
--
-- Catatan PostgreSQL:
-- ALTER TYPE ... ADD VALUE tidak bisa dijalankan dalam transaksi (harus autocommit)
-- Gunakan IF NOT EXISTS agar idempoten

ALTER TYPE exam_session_status ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE exam_session_status ADD VALUE IF NOT EXISTS 'UNDER_REVIEW';
ALTER TYPE exam_session_status ADD VALUE IF NOT EXISTS 'ASSESSMENT_COMPLETED';
ALTER TYPE exam_session_status ADD VALUE IF NOT EXISTS 'CERTIFIED';
ALTER TYPE exam_session_status ADD VALUE IF NOT EXISTS 'FAILED';
ALTER TYPE exam_session_status ADD VALUE IF NOT EXISTS 'EXPIRED';

-- Dokumentasi enum final
-- DRAFT              : Ruang ujian dibuat admin, soal belum dirilis asesor
-- READY              : Soal dirilis asesor, kandidat bisa masuk
-- IN_PROGRESS        : Kandidat sedang mengerjakan ujian (timer berjalan)
-- SUBMITTED          : Kandidat submit jawaban, sesi dikunci (access_locked=true)
-- UNDER_REVIEW       : Asesor membuka jawaban dan sedang menilai
-- ASSESSMENT_COMPLETED : Asesor selesai menilai, menunggu keputusan admin
-- CERTIFIED          : Admin mengkonfirmasi LULUS, credential diterbitkan
-- FAILED             : Admin mengkonfirmasi TIDAK LULUS (hasil negatif resmi)
-- EXPIRED            : Masa berlaku sertifikasi habis, perlu renewal
