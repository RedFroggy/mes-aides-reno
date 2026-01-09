import Button from '@codegouvfr/react-dsfr/Button'
import useIsMobile from '@/components/useIsMobile'
import { push } from '@socialgouv/matomo-next'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Share({
  text = 'Partagez la simulation en cliquant ici :',
  align = 'center',
  showWithAnswer = true,
  customCss,
}) {
  const isMobile = useIsMobile()

  const pathname = usePathname(),
    searchParams = useSearchParams()

  const [withAnswers, setWithAnswers] = useState(true)
  const [copied, setCopied] = useState(false)
  const searchParamsString = searchParams.toString()
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;

  useEffect(() => {
    setCopied(false)
  }, [searchParams])

  const share = async () => {
    try {
      await navigator.share({
        title: 'Simulation MesAidesRéno',
        text: "Simulation d'aide à la rénovation énergétique",
        url: baseUrl + pathname + '?' + searchParamsString,
      })
      setCopied(true)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        baseUrl +
          (withAnswers ? pathname : '') +
          (searchParamsString && withAnswers ? '?' + searchParamsString : ''),
      )
      setCopied(true)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <>
      <p>{text}</p>
      <form
        css={`
          text-align: ${align};
        `}
      >
        <Button
          priority="secondary"
          style={customCss}
          css={`
            ${copied &&
            `
                background: rgba(190, 242, 197, 0.2);
                border: 1px dashed var(--validColor);
                color: var(--validColor) !important;
                box-shadow: 0 0 0 0;
              `}
          `}
          title="Cliquez pour partager le lien"
          onClick={(e) => {
            e.preventDefault()
            push(['trackEvent', 'Simulateur Principal', 'Partage', 'Clic'])
            isMobile && navigator.share ? share() : copyToClipboard()
          }}
        >
          {!copied ? (
            <>
              <span aria-hidden="true">🔗</span> Copier le lien de ma simulation
            </>
          ) : (
            <>
              <span aria-hidden="true">✔</span> Lien copié
            </>
          )}
        </Button>
        {searchParamsString && showWithAnswer && (
          <div
            css={`
              display: flex;
              align-items: center;
              justify-content: ${align == 'center' ? 'space-between' : 'left'};
            `}
          >
            <input
              type="checkbox"
              id="withAnswers"
              name="withAnswers"
              checked={withAnswers}
              onChange={() => {
                setCopied(false)
                setWithAnswers(!withAnswers)
              }}
            />{' '}
            <label htmlFor="withAnswers">
              Intégrer mes données de simulation
            </label>
          </div>
        )}
        {!showWithAnswer && copied && (
          <p className="fr-mt-3v">
            Rappel : ce lien contient les données que vous avez saisies
            (adresse, catégorie de revenus…)
          </p>
        )}
      </form>
    </>
  )
}
