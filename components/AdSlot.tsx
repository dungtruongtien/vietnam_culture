// Ad slot placeholder — replace content with Google AdSense code when ready

type AdSize = 'leaderboard' | 'rectangle' | 'banner' | 'skyscraper';

const sizeMap: Record<AdSize, string> = {
  leaderboard: 'h-[90px] w-full',
  rectangle:   'h-[250px] w-[300px]',
  banner:      'h-[60px] w-full',
  skyscraper:  'h-[600px] w-[160px]',
};

export default function AdSlot({ id, size = 'rectangle' }: { id: string; size?: AdSize }) {
  if (process.env.NODE_ENV === 'production') {
    return null; // Will be replaced with actual AdSense code
  }
  return (
    <div
      data-ad-slot={id}
      className={`ad-slot ${sizeMap[size]} rounded-lg flex items-center justify-center text-xs text-vn-stone`}
      style={{ background: '#EDE3CC', border: '1px dashed #D9D3C5' }}
    >
      Ad ({id})
    </div>
  );
}
