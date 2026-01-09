import { Card } from './UI'
import { getCurDate, omit } from './utils'
import BlocConseiller from './BlocConseiller'
import BtnBackToParcoursChoice from './BtnBackToParcoursChoice'
import Feedback from '@/app/contact/Feedback'
import { useAides } from './ampleur/useAides'
import { push } from '@socialgouv/matomo-next'
import Badge from '@codegouvfr/react-dsfr/Badge'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Button from '@codegouvfr/react-dsfr/Button'
import { SharePage } from './Eligibility'
import Image from 'next/image'
import Link from 'next/link'
import iconEnvelope from '@/public/icon-envelope.svg'

export default function AideEtapes({
  setSearchParams,
  situation,
  engine,
  answeredQuestions,
}) {

  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;

  useEffect(() => {
    if (!window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.body.style.backgroundColor = '#F9FAFF'
    push(['trackEvent', 'Simulateur Principal', 'Page', 'Frise'])
    return () => {
      if (!window.matchMedia('(prefers-color-scheme: dark)').matches)
        document.body.style.backgroundColor = '#fff'
    }
  }, [])
  const [displayAll, setDisplayAll] = useState(false)
  const [copied, setCopied] = useState(false)

  const rawSearchParams = useSearchParams(),
    searchParams = Object.fromEntries(rawSearchParams.entries())
  const curDate = searchParams.date?.replaceAll('-', '/') || getCurDate()
  const aides = useAides(engine, situation)
  const hasMPRA = aides.find(
    (aide) => aide.baseDottedName == 'MPR . accompagnée' && aide.status,
  )
  const hasMPA = aides.find(
    (aide) => aide.baseDottedName == 'mpa' && aide.status,
  )
  const hasPret = aides.find((aide) => aide.type == 'prêt' && aide.status)
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        `${baseUrl}/simulation?${rawSearchParams.toString()}`
      )
      setCopied(true)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div style={{ maxWidth: '50rem', margin: 'auto' }}>
      <div id="fr-stepper-_r_f_" className="fr-stepper fr-mt-5v">
        <h1 className="fr-stepper__title">
          Mes démarches
          <span className="fr-stepper__state">Étape 3 sur 3</span>
        </h1>
        <div
          className="fr-stepper__steps"
          data-fr-current-step="3"
          data-fr-steps="3"
        ></div>
      </div>
      <h2>Les étapes clés de votre rénovation énergétique</h2>
      <div
        className="fr-mb-5v"
        css={`
          border-left: 3px solid var(--color);
          padding-left: 1rem;
          > div {
            &::before {
              background-color: var(--color);
              content: '';
              display: inline-block;
              height: 20px;
              width: 20px;
              border-radius: 50%;
              position: absolute;
              left: 0;
              margin-left: -1.8rem;
            }
            > span {
              margin-bottom: 1rem;
            }
          }
        `}
      >
        <div
          className="fr-mb-3v"
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <button
            aria-controls="modal-0"
            data-fr-opened="false"
            type="button"
            className="fr-btn fr-btn--tertiary fr-icon-share-line fr-btn--icon-right"
          >
            Partager
          </button>
          <dialog
            id="modal-0"
            className="fr-modal"
            aria-labelledby="modal-0-title"
            data-fr-concealing-backdrop="true"
          >
            <div className="fr-container fr-container--fluid fr-container-md">
              <div className="fr-grid-row fr-grid-row--center">
                <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
                  <div className="fr-modal__body">
                    <div className="fr-modal__header">
                      <button
                        aria-controls="modal-0"
                        title="Fermer"
                        type="button"
                        id="button-5"
                        className="fr-btn--close fr-btn"
                      >
                        Fermer
                      </button>
                    </div>
                    <div className="fr-modal__content">
                      <h2 id="modal-0-title" className="fr-modal__title">
                        Partager le lien de votre simulation
                      </h2>
                      <p>
                        Conservez les résultats de votre simulation en la
                        partageant par mail ou en copiant le lien.
                      </p>
                      <div className="fr-col-12">
                        <Button
                          priority="secondary"
                          title="Cliquez pour partager le lien"
                          style={{ width: '100%', justifyContent: 'center' }}
                          onClick={(e) => {
                            e.preventDefault()
                            push([
                              'trackEvent',
                              'Simulateur Principal',
                              'Partage',
                              'Clic',
                            ])
                            copyToClipboard()
                          }}
                        >
                          <span aria-hidden="true">🔗</span> Copier le lien de
                          ma simulation
                        </Button>
                      </div>
                      {copied && (
                        <div className="fr-alert fr-alert--success fr-mt-3v">
                          <p>
                            Le lien de la simulation a bien été copié dans le
                            presse-papier.
                          </p>
                          <button
                            title="Masquer le message"
                            onClick={() => setCopied(false)}
                            type="button"
                            className="fr-btn--close fr-btn fr-mt-0"
                          >
                            Masquer le message
                          </button>
                        </div>
                      )}
                      <div className="fr-col-12 fr-mt-3v">
                        <Link
                          className="fr-btn fr-btn--secondary"
                          title="Cliquez pour partager le lien"
                          style={{ width: '100%', justifyContent: 'center' }}
                          href={`mailto:?subject=${encodeURIComponent('[MesAidesRéno] Lien de ma simulation')}&body=${encodeURIComponent(
                            `Bonjour,

Veuillez retrouver votre simulation à cette adresse : 

${window.location.href}

Cordialement,
L'équipe MesAidesRéno`,
                          )}`}
                        >
                          <span aria-hidden="true" className="fr-mr-1v">
                            <Image src={iconEnvelope} alt="icone envoyer" />
                          </span>{' '}
                          Envoyer le lien par email
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </dialog>
        </div>
        <Card>
          <Badge severity="success">Terminé</Badge>
          <h3 className="fr-h5 fr-mt-3v">
            <span className="fr-icon-lightbulb-line" aria-hidden="true"></span>
            Vous avez simulé vos aides le {curDate.replaceAll('-', '/')}
          </h3>
          <p
            className="fr-badge fr-badge--new fr-py-3v fr-my-3v"
            style={{ width: '100%', textTransform: 'none' }}
          >
            Il reste des aides à compléter pour connaître leur montant.
          </p>
          <p>
            <BtnBackToParcoursChoice
              {...{
                setSearchParams,
                situation: omit(['objectif'], situation),
                answeredQuestions,
                text: 'Revoir mes aides',
              }}
            />
          </p>
        </Card>
        <Card $background="#E8EDFF">
          <p className="fr-badge fr-badge--purple-glycine">prochaine étape</p>
          <h3 className="fr-h5 fr-mt-3v">
            <span
              className="fr-icon-user-line fr-mr-1v"
              aria-hidden="true"
            ></span>
            Rencontrez votre conseiller France Rénov’
          </h3>
          <BlocConseiller situation={situation} />
          <p className="fr-mt-5v">
            ℹ️ Plus de 600 conseillers France Rénov' vous accompagnent
            gratuitement : projet, aides financières, choix des professionnels.
          </p>
        </Card>
        {hasMPA && situation['mpa . situation demandeur'] == '"occupant"' && (
          <Card>
            <h3 className="fr-h5">
              <span
                className="fr-icon-user-line fr-mr-1v"
                aria-hidden="true"
              ></span>
              Je réalise avec l’AMO le diagnostic autonomie de mon logement
            </h3>
            <p>
              L'assistant à maîtrise d'ouvrage (AMO) est habilité par l'Anah.
              C'est un interlocuteur que vous choisissez lors de votre
              rendez-vous avec le conseiller France Rénov'. Son rôle est de vous
              accompagner tout au long de votre projet : diagnostic logement
              autonomie à domicile, définition des travaux, plan de financement,
              mise en relation avec des artisans, suivi administratif et
              jusqu'au versement de la subvention.
            </p>
            <p>Il est obligatoire pour bénéficier de MaPrimeAdapt’.</p>
            <p>Il est obligatoire pour bénéficier de MaPrimeAdapt’.</p>
          </Card>
        )}
        {hasMPA ? (
          <Card>
            <h3 className="fr-h5">
              <span
                className="fr-icon-draft-line fr-mr-1v"
                aria-hidden="true"
              ></span>
              Je choisis mon artisan et demande des devis
            </h3>
            <p>
              Après votre rendez-vous avec un conseiller, contactez des artisans
              pour obtenir leurs devis. Bien qu'ils ne soient pas obligatoires,
              certains labels permettent d'identifier des professionnels
              spécialisés dans les travaux d'adaptation. En voici quelques-uns :
              Silverbat, Handibat ou Proadapt.
            </p>
            <p>
              Votre AMO pourra vous accompagner dans l'analyse et la comparaison
              de vos devis afin de sécuriser votre choix.
            </p>
            <p>
              {hasMPRA &&
                "Votre Accompagnateur Rénov' vous aidera à choisir les plus adaptés pour la suite de votre projet."}
            </p>
            {hasMPRA && (
              <p>
                <strong>Important</strong> : ne signez pas encore les devis.
              </p>
            )}
          </Card>
        ) : (
          (hasMPRA || hasPret) && (
            <Card>
              <h3 className="fr-h5">
                <span
                  className="fr-icon-draft-line fr-mr-1v"
                  aria-hidden="true"
                ></span>
                Demandez des devis
              </h3>
              <p>
                Demandez plusieurs devis à des artisans RGE.
                {hasMPRA &&
                  " Votre Accompagnateur Rénov' vous aide à choisir les meilleures offres."}
              </p>
              {hasMPRA && <p>⚠️ Attention : Ne signez pas encore les devis.</p>}
            </Card>
          )
        )}
        {!displayAll && (
          <>
            <span
              className="fr-icon-arrow-down-s-line"
              css={`
                color: var(--color);
                position: absolute;
                margin-left: -2.33rem;
                margin-top: 1rem;
                &::before {
                  --icon-size: 20px;
                  zoom: 2;
                }
              `}
              aria-hidden="true"
            ></span>{' '}
            <Button
              priority="tertiary"
              onClick={() => setDisplayAll(!displayAll)}
            >
              Afficher les étapes suivantes{' '}
              <span
                className="fr-icon-arrow-down-s-line"
                aria-hidden="true"
              ></span>
            </Button>
          </>
        )}
        {displayAll && (
          <>
            {(hasMPRA || hasMPA) && (
              <>
                <Card>
                  <h3 className="fr-h5">
                    <span
                      className="fr-icon-send-plane-line fr-mr-1v"
                      aria-hidden="true"
                    ></span>
                    Déposez votre dossier auprès de l'Anah
                  </h3>
                  {hasMPA && (
                    <p>
                      Vous pouvez déposer votre dossier auprès de l'Anah avec
                      l'appui de votre AMO. Plus votre dossier est complet et
                      bien préparé, plus son instruction sera rapide.
                    </p>
                  )}
                  {hasMPRA && (
                    <p>
                      Faites-vous accompagner par votre Accompagnateur Rénov',
                      votre mandataire ou déposez-le directement sur la
                      plateforme. Les dossiers les mieux préparés sont instruits
                      plus rapidement.
                    </p>
                  )}
                </Card>
                <Card>
                  <Badge noIcon>3 mois d'attente</Badge>
                  <h3 className="fr-h5 fr-mt-3v">
                    <span
                      className="fr-icon-checkbox-circle-line fr-mr-1v"
                      aria-hidden="true"
                    ></span>
                    L'Anah instruit votre dossier
                  </h3>
                  <p>
                    {hasMPRA ? (
                      <>
                        MaPrimeRénov’ parcours accompagné : les dossiers déposés
                        à partir du 30/09/2025 seront traités au premier
                        trimestre 2026.
                      </>
                    ) : (
                      <>
                        La période d'instruction varie grandement en fonction de
                        l'affluence et de la lutte contre la fraude. Une fois
                        validé, vous savez de quelles aides vous allez
                        bénéficier et quand vous les recevrez.
                      </>
                    )}
                  </p>
                </Card>
              </>
            )}
            {!hasMPRA && hasPret && (
              <>
                <Card>
                  <h3 className="fr-h5 fr-mt-3v">
                    <span
                      className="fr-icon-send-plane-line fr-mr-1v"
                      aria-hidden="true"
                    ></span>
                    Je contacte ma banque pour faire la demande de prêts 0%
                  </h3>
                  <p>
                    L'éco-PTZ et le prêt avance rénovation (PAR+) sont proposés
                    par les établissements de crédit et les sociétés de
                    financement qui ont signé une convention avec l’État.
                  </p>
                </Card>
                <Card>
                  <Badge noIcon>selon votre capacité d’endettement</Badge>
                  <h3 className="fr-h5 fr-mt-3v">
                    <span
                      className="fr-icon-checkbox-circle-line fr-mr-1v"
                      aria-hidden="true"
                    ></span>
                    L’établissement de crédit examine et valide votre demande
                  </h3>
                  <p>
                    L'établissement ou la société décidera, comme pour toute
                    demande de prêt, de vous prêter la somme demandée en
                    fonction de votre endettement préalable et de votre capacité
                    à rembourser.
                  </p>
                </Card>
              </>
            )}
            {hasMPRA && (
              <Card>
                <h3 className="fr-h5">
                  <span
                    className="fr-icon-pen-nib-line fr-mr-1v"
                    aria-hidden="true"
                  ></span>
                  Signez les devis et planifiez les travaux
                </h3>
              </Card>
            )}
            {hasPret && (
              <Card>
                {hasMPRA && <Badge noIcon>optionnel</Badge>}
                <h3 className={`fr-h5 ${hasMPRA && 'fr-mt-3v'}`}>
                  <span
                    className="fr-icon-money-euro-circle-line fr-mr-1v"
                    aria-hidden="true"
                  ></span>
                  Recevez les avances et démarrez les travaux
                </h3>
                {hasMPRA ? (
                  <>
                    <p>
                      Si vous êtes éligible, vous recevez l'Éco-PTZ de votre
                      banque et l'avance MaPrimeRénov' de l'Anah pour démarrer
                      le chantier !
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Le versement de l'éco-PTZ peut s'effectuer en 1 seule fois
                      sur la base des devis ou en plusieurs fois sur la base des
                      factures de travaux transmises au fur et à mesure jusqu'à
                      la date de clôture du prêt.
                    </p>
                    <p>
                      Vous pouvez payer l'acompte aux artisans. Les travaux
                      débutent !
                    </p>
                  </>
                )}
              </Card>
            )}
            {!hasMPRA && !hasMPA && (
              <Card>
                <Badge noIcon>optionnel</Badge>
                <h3 className="fr-h5 fr-mt-3v">
                  <span
                    className="fr-icon-money-euro-circle-line fr-mr-1v"
                    aria-hidden="true"
                  ></span>
                  Je dépose mes demandes d’aides
                </h3>
                <p>Primes CEE, Exonération de taxe foncière, etc.</p>
              </Card>
            )}
            <Card>
              <h3 className="fr-h5">
                <span
                  className="fr-icon-warning-line fr-mr-1v"
                  aria-hidden="true"
                ></span>
                Travaux terminés : profitez de votre logement
                {hasMPA ? ' adapté' : ' rénové'}
              </h3>
              {hasMPA ? (
                <>
                  <p>Dès les premiers mois, profitez de nombreux bénéfices :</p>
                  <ul>
                    <li>
                      🧘 Un logement plus sûr et mieux adapté à vos besoins
                      quotidiens
                    </li>
                    <li>🍀 Plus d'autonomie et de confort</li>
                    <li>🥇 Une meilleure valorisation de votre bien</li>
                  </ul>
                </>
              ) : (
                <>
                  Confort thermique, économies d'énergie, valorisation
                  immobilière : les premiers effets se font sentir dès les
                  premiers mois.
                </>
              )}
            </Card>
            <Card>
              <Badge noIcon>1 mois d'attente</Badge>
              <h3 className="fr-h5 fr-mt-3v">
                <span
                  className="fr-icon-money-euro-circle-line fr-mr-1v"
                  aria-hidden="true"
                ></span>
                Recevez vos aides
              </h3>
              {hasMPA ? (
                <p>
                  Subvention MaPrimeAdapt' : elle sera versée une fois les
                  travaux terminés.
                </p>
              ) : (
                <p>
                  Subvention MaPrimeRénov', Primes CEE... Elles arriveront
                  probablement une fois les travaux finis.
                </p>
              )}
            </Card>
            {hasPret && (
              <Card>
                {hasMPRA && <Badge noIcon>optionnel</Badge>}
                <h3 className={`fr-h5 ${hasMPRA && 'fr-my-3v'}`}>
                  <span
                    className="fr-icon-bank-card-line fr-mr-1v"
                    aria-hidden="true"
                  ></span>
                  Remboursez votre prêt
                </h3>
              </Card>
            )}
          </>
        )}
      </div>
      <div className="fr-mt-20v fr-mb-10v">
        <SharePage title="Partager la simulation" />
      </div>
      <div className="fr-mb-10v">
        <BtnBackToParcoursChoice
          {...{
            setSearchParams,
            situation: omit(['objectif'], situation),
            answeredQuestions,
            text: 'Retour',
          }}
        />
      </div>
      <Feedback />
    </div>
  )
}
