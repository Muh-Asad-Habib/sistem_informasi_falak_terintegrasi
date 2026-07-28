export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24" role="status" aria-label="Memuat halaman">
      <div className="w-10 h-10 border-4 border-sifa-green-200 border-t-sifa-green-600 rounded-full animate-spin" />
      <span className="text-xs font-semibold text-foreground/50">Memuat…</span>
    </div>
  );
}

