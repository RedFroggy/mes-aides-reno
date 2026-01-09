import ParFranceRénovTexte from '@/components/ParFranceRénovTexte'
import logo from '@/public/logo-service-de-FR.svg'
import Image from 'next/image'

export default function FooterModule() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;

  return (
    <footer>
      <a className="fr-raw-link fr-col-6" href={baseUrl}>
        <Image
          src={logo}
          className="fr-responsive-img"
          style={{ maxWidth: '60%' }}
          alt="Logo Mes Aides Réno"
        />
      </a>
      <ParFranceRénovTexte />
    </footer>
  )
}
