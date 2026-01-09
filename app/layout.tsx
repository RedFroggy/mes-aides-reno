import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Matomo from '@/utils/Matomo'
import localFont from 'next/font/local'
import './globals.css'
import { description } from './page'
import FooterContent from '@/components/FooterContent'
import {
  DsfrHead,
  getHtmlAttributes,
} from '@/src/dsfr-bootstrap/server-only-index'
import { DsfrProvider } from '@/src/dsfr-bootstrap'
import { SkipLinks } from '@codegouvfr/react-dsfr/SkipLinks'
import Banner from '@/components/Banner'
import type { Metadata } from 'next'
import React from 'react'

const ENABLE_GUICHET_BANNER =
  process.env.NEXT_PUBLIC_ENABLE_GUICHET_BANNER === 'true'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Mes aides réno 2026',
    description: description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_BASE_URL),
    openGraph: {
      images: ['/jaquette.png'],
    },
  }
}

const marianneFont = localFont({
  src: [
    {
      path: '../fonts/Marianne-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../fonts/Marianne-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/Marianne-Regular.woff2',
      weight: 'normal',
      style: 'normal',
    },
    {
      path: '../fonts/Marianne-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/Marianne-Bold.woff2',
      weight: 'bold',
      style: 'normal',
    },
    {
      path: '../fonts/Marianne-ExtraBold.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-marianne',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const lang = 'fr'
  return (
    <html {...getHtmlAttributes({ lang })}>
      <head>
        <DsfrHead />
      </head>
      <body className={marianneFont.className}>
        <DsfrProvider lang={lang}>
          <SkipLinks
            links={[
              {
                anchor: '#content',
                label: 'Contenu',
              },
              {
                anchor: '#fr-header-with-horizontal-operator-logo-menu-button',
                label: 'Menu',
              },
              {
                anchor: '#fr-footer',
                label: 'Pied de page',
              },
            ]}
          />
          {ENABLE_GUICHET_BANNER && (
            <Banner
              title={<>Loi de finances 2026<br/></>}
              description={
                <>
                  En l'absence de loi de finances 2026, le dépôt de nouveaux
                  dossiers MaPrimeRénov', Ma Prime Adapt, Ma Prime Logement
                  Décent et Loc'Avantages est actuellement suspendu. Le
                  simulateur Mes Aides Réno reste accessible. Nous vous invitons
                  à consulter régulièrement le site{' '}
                  <a
                    href="https://france-renov.gouv.fr"
                    title="france-renov.gouv.fr - lien externe - ouvre une nouvelle fenêtre"
                    target="_blank"
                    rel="noopener external"
                    className="fr-notice__link"
                  >
                    france-renov.gouv.fr
                  </a>{' '}
                  pour suivre l’évolution de la situation.
                </>
              }
            />
          )}
          <Header />
          {children}
          <Footer>
            <FooterContent />
          </Footer>
        </DsfrProvider>
        <Matomo />
      </body>
    </html>
  )
}
