export interface ValidationResult {
  isValid: boolean;
  status: 'READY_FOR_INDEXING' | 'NOT_READY_FOR_INDEXING';
  errors: string[];
  warnings: string[];
  checks: {
    title: boolean;
    authors: boolean;
    abstract: boolean;
    doi: boolean;
    license: boolean;
    volume: boolean;
    issue: boolean;
    orcid: boolean;
    issn: boolean;
  };
}

export class PublicationMetadataValidator {
  /**
   * Validates submission and journal metadata against global index standards (DOAJ, Google Scholar, SINTA, OpenAIRE).
   */
  public static validate(sub: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const checks = {
      title: false,
      authors: false,
      abstract: false,
      doi: false,
      license: false,
      volume: false,
      issue: false,
      orcid: false,
      issn: false
    };

    // 1. Title check
    if (sub.title && sub.title.trim().length > 5) {
      checks.title = true;
    } else {
      errors.push('Judul artikel kosong atau terlalu pendek (minimal 6 karakter).');
    }

    // 2. Abstract check
    let abstractRaw = sub.abstract;
    let parsedAbstract = '';
    if (typeof abstractRaw === 'string' && abstractRaw.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(abstractRaw);
        parsedAbstract = parsed.abstract_en || parsed.abstract || '';
      } catch {
        parsedAbstract = abstractRaw;
      }
    } else {
      parsedAbstract = abstractRaw || '';
    }

    if (parsedAbstract.trim().length > 30) {
      checks.abstract = true;
    } else {
      errors.push('Abstrak artikel kosong atau kurang dari 30 karakter.');
    }

    // 3. Authors check
    const hasAuthor = sub.author || sub.author_name;
    let explicitAuthorsCount = 0;
    let hasOrcid = false;

    if (typeof abstractRaw === 'string' && abstractRaw.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(abstractRaw);
        if (parsed.authors && Array.isArray(parsed.authors) && parsed.authors.length > 0) {
          explicitAuthorsCount = parsed.authors.length;
          hasOrcid = parsed.authors.some((a: any) => a.orcid && a.orcid.trim().length > 0);
        }
      } catch {}
    }

    if (hasAuthor || explicitAuthorsCount > 0) {
      checks.authors = true;
      if (hasOrcid || (sub.orcid && sub.orcid.trim().length > 0)) {
        checks.orcid = true;
      } else {
        warnings.push('Tidak ada ORCID ID yang tersemat untuk penulis. Sangat disarankan untuk indeksasi ORCID/OpenAIRE.');
      }
    } else {
      errors.push('Artikel harus memiliki minimal 1 nama penulis.');
    }

    // 4. DOI check (Preservation first)
    if (sub.doi && /^10\.\d{4,9}\/\S+$/i.test(sub.doi.trim())) {
      checks.doi = true;
    } else {
      errors.push('Naskah belum memiliki DOI atau format DOI tidak valid.');
    }

    // 5. License check
    if (sub.license || sub.index_status?.license || sub.keywords) {
      checks.license = true;
    } else {
      warnings.push('Lisensi naskah tidak dideklarasikan (default CC-BY 4.0 akan digunakan).');
    }

    // 6. Volume & Issue checks
    if (sub.volume && sub.volume.trim().length > 0) {
      checks.volume = true;
    } else {
      errors.push('Kolom volume jurnal kosong.');
    }

    if (sub.issue && sub.issue.trim().length > 0) {
      checks.issue = true;
    } else {
      errors.push('Kolom edisi/issue jurnal kosong.');
    }

    // 7. ISSN checks
    if (sub.issn && sub.issn.trim().length > 0) {
      checks.issn = true;
    } else {
      warnings.push('ISSN Jurnal kosong. Beberapa indeksasi mewajibkan e-ISSN aktif.');
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      status: isValid ? 'READY_FOR_INDEXING' : 'NOT_READY_FOR_INDEXING',
      errors,
      warnings,
      checks
    };
  }
}
