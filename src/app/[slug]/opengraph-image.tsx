import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export const alt = 'Tarjeta de Presentación Digital'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  const card = await prisma.businessCard.findUnique({
    where: { slug },
  })

  if (!card) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Tarjeta Digital no encontrada
        </div>
      ),
      { ...size }
    )
  }

  // Cast to any for extended props
  const extendedCard = card as any
  const bannerUrl = extendedCard.bannerUrl
  const logoUrl = extendedCard.logoUrl
  const themeColor = extendedCard.themeColor || '#000000'

  return new ImageResponse(
    (
      <div
        style={{
          background: themeColor,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Banner Background if available */}
        {bannerUrl && (
          <img
            src={bannerUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.6, 
            }}
          />
        )}

        {/* Logo or Initial */}
        {logoUrl ? (
          <img
            src={logoUrl}
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              border: '8px solid white',
              objectFit: 'cover',
              zIndex: 10,
            }}
          />
        ) : (
           <div
            style={{
                width: 150,
                height: 150,
                borderRadius: 75,
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 64,
                fontWeight: 'bold',
                color: themeColor,
                border: '4px solid white',
                zIndex: 10,
            }}
           >
             {extendedCard.title?.[0]?.toUpperCase() || 'T'}
           </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            color: 'white',
            marginTop: 40,
            textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            zIndex: 10,
            textAlign: 'center',
            padding: '0 20px',
          }}
        >
          {extendedCard.title}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
