import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Bell, FileText, Clock } from "lucide-react";
import { cookies } from "next/headers";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const mockUserCookie = cookieStore.get("mock_user")?.value;

  if (!user && !mockUserCookie) {
    redirect("/auth/login");
  }

  // Fetch submissions to display as notifications
  // Using an alias since the schema might use author_id or submitter_id
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select(`
      *,
      journals (name)
    `)
    .order("created_at", { ascending: false });

  const notifications = submissions || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex items-center gap-3 pb-6 border-b border-zinc-800">
        <div className="p-3 bg-[#c9a84c]/10 rounded-xl">
          <Bell className="w-6 h-6 text-[#c9a84c]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Semua Notifikasi</h1>
          <p className="text-zinc-400 mt-1 text-sm">Riwayat aktivitas dan naskah masuk di sistem Anda.</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-medium mb-1">Belum ada notifikasi</h3>
            <p className="text-zinc-500 text-sm">Tidak ada aktivitas baru atau naskah masuk saat ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {notifications.map((notif: any) => {
              // Parse abstract if it's JSON
              let abstractText = notif.abstract;
              let authors = [];
              try {
                const parsed = JSON.parse(notif.abstract);
                if (parsed.abstract_en || parsed.abstract_id) {
                  abstractText = parsed.abstract_id || parsed.abstract_en;
                }
                if (parsed.authors) {
                  authors = parsed.authors;
                }
              } catch (e) {
                // Not JSON, keep as is
              }

              const journalName = notif.journals?.name || "Jurnal Tidak Diketahui";
              const authorName = authors.length > 0 ? authors[0].full_name : (notif.profiles?.full_name || "Penulis");

              return (
                <div key={notif.id || notif.submission_id} className="p-6 hover:bg-zinc-800/30 transition-colors group">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="mt-1">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-emerald-500" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-white font-medium text-base">
                          Naskah Baru Masuk: <span className="text-[#c9a84c]">{notif.title}</span>
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(notif.created_at).toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-zinc-400">
                        <span className="text-zinc-300 font-medium">{authorName}</span> telah mengirimkan naskah ke jurnal <span className="text-zinc-300 font-medium">{journalName}</span>.
                      </div>

                      {abstractText && (
                        <div className="mt-3 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2">Abstrak</p>
                          <p className="text-sm text-zinc-400 line-clamp-3">{abstractText}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
