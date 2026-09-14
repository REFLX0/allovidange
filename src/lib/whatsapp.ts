/**
 * ALLO VIDANGE — Utilitaires WhatsApp
 * Génère des liens click-to-WhatsApp avec messages préremplis.
 * Aucune API externe requise — pur wa.me/
 */

import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AppointmentInfo {
  customerName: string;
  serviceName: string;
  date: Date;
  startTime: string; // "HH:mm"
  reference: string;
}

/**
 * Formate un numéro de téléphone pour WhatsApp (format international).
 * Ex: "55 123 456" → "21655123456"
 */
export function formatWhatsAppNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");
  if (cleaned.startsWith("+")) return cleaned.substring(1);
  if (cleaned.startsWith("00")) return cleaned.substring(2);
  if (cleaned.length === 8) return `216${cleaned}`;
  return cleaned;
}

/**
 * Génère un lien WhatsApp pour confirmer un RDV au client.
 * Utilisé par l'admin pour contacter le client.
 */
export function buildAdminToCustomerUrl(
  whatsappPhone: string,
  appt: AppointmentInfo
): string {
  const formattedDate = format(appt.date, "d MMMM yyyy", { locale: fr });
  const phone = formatWhatsAppNumber(whatsappPhone);

  const message = `Bonjour ${appt.customerName}, votre rendez-vous chez ALLO VIDANGE est confirmé ✅

📋 Prestation : ${appt.serviceName}
📅 Date : ${formattedDate}
⏰ Heure : ${appt.startTime}
🔖 Réf : ${appt.reference}

Localisation : Tunis, Tunisie
À très bientôt !`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Message de rappel de RDV (la veille ou le jour même).
 */
export function buildAdminReminderUrl(
  whatsappPhone: string,
  appt: AppointmentInfo
): string {
  const formattedDate = format(appt.date, "d MMMM yyyy", { locale: fr });
  const phone = formatWhatsAppNumber(whatsappPhone);

  const message = `Bonjour ${appt.customerName}, rappel de votre rendez-vous chez ALLO VIDANGE :

📅 Date : ${formattedDate}
⏰ Heure : ${appt.startTime}
📋 Prestation : ${appt.serviceName}
🔖 Réf : ${appt.reference}

En cas de retard ou d'empêchement, merci de nous prévenir. À tout à l'heure !`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Message lorsque l'intervention est terminée et le véhicule prêt.
 */
export function buildAdminReadyUrl(
  whatsappPhone: string,
  appt: { customerName: string; serviceName: string; reference: string }
): string {
  const phone = formatWhatsAppNumber(whatsappPhone);

  const message = `Bonjour ${appt.customerName}, l'intervention sur votre véhicule est terminée et il est prêt à être récupéré chez ALLO VIDANGE ! ✅

📋 Prestation : ${appt.serviceName}
🔖 Réf : ${appt.reference}

Merci pour votre confiance et bonne route !`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Génère un lien WhatsApp pour qu'un client confirme son RDV.
 * Affiché sur la page de confirmation de réservation.
 */
export function buildCustomerConfirmationUrl(
  whatsappPhone: string,
  appt: AppointmentInfo
): string {
  const formattedDate = format(appt.date, "d MMMM yyyy", { locale: fr });
  const phone = formatWhatsAppNumber(whatsappPhone);

  const message = `Bonjour ALLO VIDANGE, je souhaite confirmer mon rendez-vous :

📋 Service : ${appt.serviceName}
📅 Date : ${formattedDate}
⏰ Heure : ${appt.startTime}
🔖 Référence : ${appt.reference}
👤 Nom : ${appt.customerName}

Merci.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Génère un lien WhatsApp simple pour contacter ALLO VIDANGE.
 */
export function buildContactUrl(whatsappPhone: string, message?: string): string {
  const phone = formatWhatsAppNumber(whatsappPhone);
  const defaultMessage = "Bonjour ALLO VIDANGE, je souhaite prendre un rendez-vous.";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message ?? defaultMessage)}`;
}

/**
 * Génère un lien tel: pour appeler directement.
 */
export function buildCallUrl(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}
