'use client'
import { ReactNode, useEffect, useState } from 'react'

const LS_KEY = 'dsfr_banner_closed'

interface BannerProps {
  title: ReactNode
  description?: ReactNode
}

export default function Banner({
  title,
  description = null,
}: Readonly<BannerProps>) {
  const [bannerRead, setBannerRead] = useState<boolean | null>(null)

  useEffect(() => {
    const storedValue = localStorage.getItem(LS_KEY)
    setBannerRead(storedValue === 'true')
  }, [])

  const closeBanner = () => {
    localStorage.setItem(LS_KEY, 'true')
    setBannerRead(true)
  }

  if (bannerRead !== false) {
    return null
  }

  return (
    <div className="fr-notice fr-notice--info">
      <div className="fr-container">
        <div className="fr-notice__body">
          <p>
            <span className="fr-notice__title">{title}</span>
            {description && (
              <span className="fr-notice__desc">{description}</span>
            )}
          </p>
          <button
            title="Masquer le message"
            onClick={closeBanner}
            type="button"
            className="fr-btn--close fr-btn"
          >
            Masquer le message
          </button>
        </div>
      </div>
    </div>
  )
}
