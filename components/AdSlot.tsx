// Ad slot placeholder — replace content with Google AdSense code when ready

type AdSize = 'leaderboard' | 'rectangle' | 'banner';

const sizeMap: Record<AdSize, string> = {
  leaderboard: 'h-[90px]',
  rectangle: 'h-[250px]',
  banner: 'h-[60px]',
};

export default function AdSlot({ id, size = 'rectangle' }: { id: string; size?: AdSize }) {
  if (process.env.NODE_ENV === 'production') {
    return null; // Will be replaced with actual AdSense code
  }
  return (
    <div
      data-ad-slot={id}
      className={`ad-slot ${sizeMap[size]} rounded-lg`}
    >
      Ad ({id})
    </div>
  );
}
