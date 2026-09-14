import {
  ArrowRight,
  ArrowUpRight,
  CalendarDots,
  Car,
  Check,
  CheckCircle,
  Clock,
  Engine,
  Funnel,
  Gauge,
  MapPin,
  Phone,
  ShieldCheck,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import { buildCallUrl, buildContactUrl } from "@/lib/whatsapp";
import { prisma } from "@/lib/prisma";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";

export const dynamic = "force-dynamic";

const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

async function getPublicData() {
  try {
    const [services, settings, hours] = await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.businessSettings.findUnique({ where: { id: "singleton" } }),
      prisma.businessHours.findMany({ orderBy: { dayOfWeek: "asc" } }),
    ]);

    return { services, settings, hours };
  } catch (err) {
    console.warn("Could not query the public workshop data:", err);
    return { services: [], settings: null, hours: [] };
  }
}

function ServiceGlyph({ name }: { name: string }) {
  const iconProps = { size: 23, weight: "duotone" as const, "aria-hidden": true };
  const service = name.toLowerCase();

  if (service.includes("filtre")) return <Funnel {...iconProps} />;
  if (service.includes("diagnostic")) return <Gauge {...iconProps} />;
  if (service.includes("vidange") || service.includes("liquide")) return <Engine {...iconProps} />;
  return <Wrench {...iconProps} />;
}

export default async function HomePage() {
  const { services, settings, hours } = await getPublicData();
  const phoneUrl = settings?.phone ? buildCallUrl(settings.phone) : null;
  const whatsappUrl = settings?.whatsappPhone ? buildContactUrl(settings.whatsappPhone) : null;

  return (
    <div className="public-shell">
      <PublicNav />

      <main>
        <section className="home-hero">
          <div className="home-hero-media" aria-hidden="true">
            <Image
              src="/hero-bg.png"
              alt=""
              fill
              priority
              quality={75}
              sizes="(max-width: 900px) 100vw, 55vw"
              className="home-hero-image"
            />
          </div>
          <div className="home-hero-rule" aria-hidden="true" />
          <div className="container home-hero-content">
            <StaggerContainer className="home-hero-copy">
              <StaggerItem>
                <p className="home-location">
                  <MapPin size={16} weight="fill" aria-hidden="true" />
                  Atelier automobile à Tunis
                </p>
              </StaggerItem>
              <StaggerItem>
                <h1>
                  L&apos;entretien qui
                  <span>respecte votre temps.</span>
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="home-hero-lede">
                  Réservez votre vidange, vos filtres ou un diagnostic. Dites-nous ce qu&apos;il faut faire, choisissez un créneau, puis arrivez l&apos;esprit tranquille.
                </p>
              </StaggerItem>
              <StaggerItem>
                <div className="home-hero-actions">
                  <Link href="/reservation" className="btn btn-primary btn-lg">
                    <CalendarDots size={20} weight="bold" aria-hidden="true" />
                    Réserver un créneau
                    <ArrowRight size={18} weight="bold" aria-hidden="true" />
                  </Link>
                  {phoneUrl && (
                    <a href={phoneUrl} className="text-action">
                      <Phone size={17} weight="bold" aria-hidden="true" />
                      Nous appeler
                    </a>
                  )}
                </div>
              </StaggerItem>
              <StaggerItem>
                <ul className="home-hero-notes" aria-label="Les avantages du rendez-vous en ligne">
                  <li><Check size={15} weight="bold" aria-hidden="true" /> Choix du créneau</li>
                  <li><Check size={15} weight="bold" aria-hidden="true" /> Véhicule préparé</li>
                  <li><Check size={15} weight="bold" aria-hidden="true" /> Confirmation immédiate</li>
                </ul>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        <section className="section section-services" id="services">
          <div className="container">
            <div className="section-heading service-heading">
              <div>
                <p className="section-kicker">Prestations de l&apos;atelier</p>
                <h2>Les essentiels, bien faits.</h2>
              </div>
              <p>Choisissez la prestation dont votre véhicule a besoin. Nous collectons les informations utiles avant le rendez-vous.</p>
            </div>

            {services.length ? (
              <StaggerContainer className="service-ledger-grid">
                {services.map((service, index) => (
                  <StaggerItem key={service.id}>
                    <article className="service-ledger-item group">
                      <div className="service-ledger-index">{String(index + 1).padStart(2, "0")}</div>
                      <div className="service-ledger-icon group-hover:text-brand transition-colors"><ServiceGlyph name={service.name} /></div>
                      <div className="service-ledger-copy">
                        <h3 className="group-hover:text-brand transition-colors">{service.name}</h3>
                        <p>{service.description || "Intervention préparée selon votre véhicule."}</p>
                      </div>
                      <div className="service-ledger-meta">
                        <span><Clock size={15} weight="bold" aria-hidden="true" /> {service.duration} min</span>
                        {service.price ? <strong>{service.price.toLocaleString()} DT</strong> : <strong>Sur devis</strong>}
                      </div>
                    </article>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <div className="empty-state">Les prestations sont en cours de configuration.</div>
            )}

            <div className="section-action">
              <Link href="/reservation" className="btn btn-secondary">
                Voir les créneaux disponibles
                <ArrowRight size={17} weight="bold" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="section section-process" id="process">
          <FadeIn className="container process-layout">
            <div className="process-intro">
              <p className="section-kicker">Un rendez-vous clair</p>
              <h2>Quelques détails maintenant. Moins d&apos;attente ensuite.</h2>
              <p>Le parcours garde l&apos;essentiel dans le bon ordre, pour que l&apos;atelier puisse préparer votre passage.</p>
              <Link href="/reservation" className="text-action text-action-red">
                Commencer la réservation
                <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
              </Link>
            </div>
            <ol className="process-ledger">
              <li>
                <span className="process-icon"><Wrench size={21} weight="duotone" aria-hidden="true" /></span>
                <div><strong>La prestation</strong><p>Choisissez ce que l&apos;atelier doit préparer.</p></div>
              </li>
              <li>
                <span className="process-icon"><Car size={21} weight="duotone" aria-hidden="true" /></span>
                <div><strong>Votre véhicule</strong><p>Ajoutez les repères utiles pour une prise en charge adaptée.</p></div>
              </li>
              <li>
                <span className="process-icon"><CalendarDots size={21} weight="duotone" aria-hidden="true" /></span>
                <div><strong>Le créneau</strong><p>Sélectionnez un jour et une heure disponibles.</p></div>
              </li>
              <li>
                <span className="process-icon"><CheckCircle size={21} weight="duotone" aria-hidden="true" /></span>
                <div><strong>La confirmation</strong><p>Recevez votre référence de rendez-vous à conserver.</p></div>
              </li>
            </ol>
          </FadeIn>
        </section>

        <section className="section vehicle-section">
          <FadeIn className="container vehicle-layout">
            <div className="vehicle-board" aria-hidden="true">
              <div className="vehicle-board-topline" />
              <Car size={96} weight="thin" />
              <div className="vehicle-board-label">Fiche véhicule</div>
              <span>Marque · modèle · motorisation · kilométrage</span>
            </div>
            <div className="vehicle-copy">
              <p className="section-kicker">Un entretien adapté</p>
              <h2>Votre véhicule est connu avant votre arrivée.</h2>
              <p>Les informations de votre véhicule aident l&apos;équipe à anticiper l&apos;intervention et à vous accueillir efficacement.</p>
              <ul>
                <li><Check size={17} weight="bold" aria-hidden="true" /> Marque, modèle et motorisation</li>
                <li><Check size={17} weight="bold" aria-hidden="true" /> Kilométrage et immatriculation, si vous les avez</li>
                <li><ShieldCheck size={18} weight="bold" aria-hidden="true" /> Données utilisées pour préparer votre rendez-vous</li>
              </ul>
            </div>
          </FadeIn>
        </section>

        <section className="section contact-section" id="contact">
          <div className="container">
            <div className="section-heading contact-heading">
              <div>
                <p className="section-kicker">L&apos;atelier</p>
                <h2>Besoin de nous joindre ?</h2>
              </div>
              <p>Pour une question avant de réserver, contactez directement l&apos;équipe.</p>
            </div>
            <div className="contact-layout">
              <div className="contact-details">
                {settings?.phone && phoneUrl && (
                  <a href={phoneUrl} className="contact-row">
                    <Phone size={21} weight="duotone" aria-hidden="true" />
                    <span><small>Téléphone</small><strong>{settings.phone}</strong></span>
                    <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
                  </a>
                )}
                {settings?.whatsappPhone && whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="contact-row">
                    <Phone size={21} weight="duotone" aria-hidden="true" />
                    <span><small>WhatsApp</small><strong>{settings.whatsappPhone}</strong></span>
                    <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
                  </a>
                )}
                {settings?.address && (
                  <div className="contact-row contact-row-static">
                    <MapPin size={21} weight="duotone" aria-hidden="true" />
                    <span><small>Adresse</small><strong>{settings.address}</strong></span>
                  </div>
                )}
                {hours.length > 0 && (
                  <div className="hours-ledger">
                    <div className="hours-ledger-title"><Clock size={18} weight="bold" aria-hidden="true" /> Horaires d&apos;ouverture</div>
                    {hours.map((hour) => (
                      <div className="hours-row" key={hour.id}>
                        <span>{DAY_NAMES[hour.dayOfWeek]}</span>
                        <strong>{hour.isOpen ? `${hour.openTime} - ${hour.closeTime}` : "Fermé"}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="contact-map">
                {settings?.googleMapsUrl ? (
                  <iframe
                    src={settings.googleMapsUrl}
                    title="Localisation de l'atelier ALLO VIDANGE"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="map-placeholder">
                    <MapPin size={36} weight="duotone" aria-hidden="true" />
                    <p>La carte sera disponible ici.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div className="container public-footer-inner">
          <Link href="/" className="brand-lockup">
            <Image src="/logo.png" alt="" width={36} height={36} />
            <span><strong>ALLO VIDANGE</strong><small>Vidange · filtres · entretien</small></span>
          </Link>
          <p>© {new Date().getFullYear()} ALLO VIDANGE. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
