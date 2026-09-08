export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#ff2d3f]" />
        <p className="text-sm text-white/40">Loading admin panel...</p>
      </div>
    </div>
  );
}
