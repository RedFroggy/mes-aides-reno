import { PageBlock } from '@/components/UI'
import { Metadata } from 'next/types'
import { parse } from 'marked'
import { StartDsfrOnHydration } from '@/src/dsfr-bootstrap'
import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb'

const content = `

# À propos de Mes Aides Réno

Mes Aides Réno est un service de France Rénov’ opéré par l’Agence nationale de l’habitat (Anah)
destiné à simplifier l’accès à l’information sur les aides à la rénovation. Conçu au sein de l’incubateur beta.gouv dans le cadre d’une phase d’expérimentation portée par la Direction interministérielle du numérique (DINUM), 
le service est désormais pérennisé et déployé à l’échelle nationale sous la responsabilité de l’Anah <a href="https://www.beta.gouv.fr/startups/mesaidesreno.html">fiche produit</a>.
## Partenaires et développeurs

Mes Aides Réno a été conçu pour être facilement réutilisable et intégrable par des services tiers.

Le code métier est basé sur le langage <a href="https://publi.codes">Publicodes</a> pour maximiser son ouverture et sa lisibilité.
<a href="${process.env.NEXT_PUBLIC_APP_BASE_URL}/api-doc">Une API</a> est disponible pour comprendre notre modèle métier et réutiliser les données.

## Mentions légales

Ce site Web est opéré par l’Agence nationale de l’habitat (Anah). Téléphone Relation usager : <a href="tel:0806703803">0806 70 38 03</a> (Service gratuit + prix d'un appel)
`

export const metadata: Metadata = {
  title: 'À propos - Mes aides réno',
}

export default function About() {
  return (
    <>
      <StartDsfrOnHydration />
      <PageBlock>
        <Breadcrumb
          currentPageLabel="A propos"
          homeLinkProps={{
            href: '/',
          }}
          segments={[]}
        />
        <section dangerouslySetInnerHTML={{ __html: parse(content) }} />
      </PageBlock>
    </>
  )
}
