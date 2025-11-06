// app/mission/[id]/page.tsx
// (Server Component – PAS de "use client" ici)

import MissionDetailClient from '@/components/client/MissionDetailClient';

export default function Page({ params }: { params: { id: string } }) {
  // On passe l'id au composant client
  return <MissionDetailClient id={params.id} />;
}
