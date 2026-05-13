export default function Loader({ size = 'md' }) {
  const s = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-14 h-14' : 'w-9 h-9';
  return (
    <div className="flex items-center justify-center py-10">
      <div className={`${s} border-2 border-[#C9A84C]/30 border-t-[#C9A84C] rounded-full animate-spin`} />
    </div>
  );
}
