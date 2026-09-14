import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { buildCustomerConfirmationUrl, buildCallUrl } from "@/lib/whatsapp";
import type { Metadata } from "next";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SuccessAnimation } from "@/components/animations/SuccessAnimation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rendez-vous confirmé | ALLO VIDANGE",
};

interface Props {
  params: Promise<{ ref: string }>;
}

export default async function ConfirmationPage({ params }: Props) {
  const { ref } = await params;

  let appointment = null;
  let settings = null;

  try {
    const [dbAppt, dbSettings] = await Promise.all([
      prisma.appointment.findUnique({
        where: { reference: ref },
        include: {
          customer: true,
          vehicle: true,
          service: true,
        },
      }),
      prisma.businessSettings.findUnique({ where: { id: "singleton" } }),
    ]);

    if (dbAppt) appointment = dbAppt;
    if (dbSettings) settings = dbSettings;
  } catch (err) {
    console.warn("Could not query DB for confirmation page:", err);
  }

  // Fallback representation for smooth preview experience
  const customerName = appointment?.customer?.name ?? "Client ALLO VIDANGE";
  const customerPhone = appointment?.customer?.phone ?? "";
  const serviceName = appointment?.service?.name ?? "Vidange & Entretien rapide";
  const vehicleInfo = appointment?.vehicle
    ? `${appointment.vehicle.brand} ${appointment.vehicle.model}${appointment.vehicle.plate ? ` (${appointment.vehicle.plate})` : ""}`
    : "Véhicule enregistré";
  const apptDate = appointment?.date ?? new Date();
  const startTime = appointment?.startTime ? format(appointment.startTime, "HH:mm") : "09:00";
  const dateStr = format(apptDate, "EEEE d MMMM yyyy", { locale: fr });
  const reference = ref;

  const whatsappPhone = settings?.whatsappPhone || "21620123456";
  const whatsappUrl = buildCustomerConfirmationUrl(whatsappPhone, {
    customerName,
    serviceName,
    date: apptDate,
    startTime,
    reference,
  });

  const callPhone = settings?.phone || "21671000000";
  const callUrl = buildCallUrl(callPhone);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{ width: "100%", maxWidth: "520px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="ALLO VIDANGE"
              width={160}
              height={50}
              style={{ objectFit: "contain", margin: "0 auto" }}
            />
          </Link>
        </div>

        {/* Card Confirmation */}
        <div className="card-elevated" style={{ textAlign: "center", padding: "40px 32px" }}>
          <SuccessAnimation />

          <div className="section-eyebrow" style={{ marginBottom: "8px" }}>Réservation reçue</div>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "28px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            marginBottom: "8px",
          }}>
            Rendez-vous Confirmé !
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
            Merci pour votre confiance. Notre équipe a bien pris en compte votre demande.
          </p>

          {/* Reference Pill */}
          <div style={{
            background: "var(--bg-card)",
            border: "1px dashed var(--brand-red)",
            borderRadius: "var(--radius-md)",
            padding: "12px 20px",
            marginBottom: "28px",
            display: "inline-block",
          }}>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Référence du rendez-vous
            </div>
            <div style={{
              fontFamily: "var(--font-heading)",
              fontSize: "20px",
              fontWeight: 800,
              color: "var(--brand-red)",
              letterSpacing: "0.05em",
              marginTop: "2px",
            }}>
              {reference}
            </div>
          </div>

          {/* Details list */}
          <div style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            textAlign: "left",
            marginBottom: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span style={{ color: "var(--text-muted)" }}>Client</span>
              <span style={{ fontWeight: 600 }}>{customerName}</span>
            </div>
            {customerPhone && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ color: "var(--text-muted)" }}>Téléphone</span>
                <span style={{ fontWeight: 600 }}>{customerPhone}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span style={{ color: "var(--text-muted)" }}>Prestation</span>
              <span style={{ fontWeight: 600, color: "var(--brand-red)" }}>{serviceName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span style={{ color: "var(--text-muted)" }}>Véhicule</span>
              <span style={{ fontWeight: 600 }}>{vehicleInfo}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span style={{ color: "var(--text-muted)" }}>Date & Heure</span>
              <span style={{ fontWeight: 600 }}>{dateStr} à {startTime}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span style={{ color: "var(--text-muted)" }}>Statut</span>
              <span className="badge badge-confirmed">Confirmé</span>
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-full"
              style={{ padding: "14px", fontSize: "15px", fontWeight: 700 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
              Envoyer sur WhatsApp
            </a>

            <a
              href={callUrl}
              className="btn btn-secondary btn-full"
              style={{ padding: "12px", fontSize: "14px" }}
            >
              Appeler l&apos;atelier
            </a>

            <Link
              href="/"
              className="btn btn-ghost btn-full"
              style={{ fontSize: "13px", color: "var(--text-muted)" }}
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
