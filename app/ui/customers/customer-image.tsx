'use client';

import Image from 'next/image';

// A dedicated client component for the customer image
// to handle the onError event handler.
export default function CustomerImage({
  src,
  alt,
}: {
  src: string | null | undefined;
  alt: string;
}) {
  const fallbackSrc = '/placeholder-user.png';

  return (
    <Image
      src={src || fallbackSrc}
      alt={alt}
      className="rounded-full"
      width={28}
      height={28}
      // This event handler now lives safely inside a Client Component
      onError={(e) => {
        // In case the provided src fails, we set it to the fallback
        e.currentTarget.src = fallbackSrc;
      }}
    />
  );
}