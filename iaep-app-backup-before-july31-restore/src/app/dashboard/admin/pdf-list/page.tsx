import React from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPdfList() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Fetch all submissions
    const { data: submissions } = await supabase
        .from('submissions')
        .select('id, title, file_url, original_file_url, profiles:author_id(full_name)');
        
    let pdfs = [];
    
    for (const sub of submissions || []) {
        let actualFolder = sub.id;
        try {
            const hex = sub.id.replace(/-/g, '');
            const str = Buffer.from(hex, 'hex').toString('utf8');
            if (str.startsWith('sub_')) actualFolder = str.replace(/\0/g, '');
        } catch(e) {}
        
        if (sub.file_url && sub.file_url.includes('/')) {
            actualFolder = sub.file_url.split('/')[0];
        }
        
        const { data: bucketFiles } = await supabase.storage.from('manuscripts').list(actualFolder);
        if (bucketFiles) {
            for (const f of bucketFiles) {
                // Check if it's Beridentitas (title_page) AND PDF
                if (f.name.includes('title_page') && f.name.toLowerCase().endsWith('.pdf')) {
                    const { data } = await supabase.storage.from('manuscripts').createSignedUrl(`${actualFolder}/${f.name}`, 3600 * 24);
                    pdfs.push({
                        submission_id: sub.id,
                        title: sub.title,
                        author: Array.isArray(sub.profiles) ? (sub.profiles[0] as any)?.full_name || 'Unknown' : (sub.profiles as any)?.full_name || 'Unknown',
                        file_name: f.name,
                        url: data?.signedUrl
                    });
                }
            }
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Daftar File PDF Beridentitas</h1>
                    <p className="text-sm text-gray-500 mt-1">Daftar semua naskah asli (beridentitas) yang disubmit dalam format PDF.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold">
                    Total: {pdfs.length} File
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {pdfs.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Author</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Judul Artikel</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama File</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pdfs.map((pdf, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{pdf.author}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-700 font-medium line-clamp-2 max-w-md">{pdf.title}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded w-max">{pdf.file_name}</div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <a 
                                            href={pdf.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            Download PDF
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="bg-gray-100 p-4 rounded-full text-gray-400 mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Tidak Ada File PDF Beridentitas</h3>
                        <p className="text-sm text-gray-500">Belum ada author yang mengunggah naskah asli dalam format .pdf (kebanyakan author mengunggah format .docx).</p>
                    </div>
                )}
            </div>
        </div>
    );
}
