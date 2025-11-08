// app/game/page.tsx
import GamePageClient from '@/components/client/GamePageClient';

export default function Page({ searchParams }: { searchParams: { roomId?: string } }) {
  const roomId = searchParams?.roomId ?? 'dev-room';
  return <GamePageClient roomId={roomId} />;
}
