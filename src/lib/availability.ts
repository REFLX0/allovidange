/**
 * ALLO VIDANGE — Moteur de disponibilité
 * Calcule les créneaux disponibles pour une date donnée.
 */
import {
  parse,
  format,
  addMinutes,
  isBefore,
  isEqual,
  startOfDay,
  eachDayOfInterval,
  getDay,
  addDays,
  isAfter,
} from "date-fns";

export interface TimeSlot {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  available: boolean;
}

export interface BusinessHoursData {
  dayOfWeek: number; // 0=Dim, 1=Lun, ..., 6=Sam
  isOpen: boolean;
  openTime: string;  // "HH:mm"
  closeTime: string; // "HH:mm"
}

export interface BlockedPeriodData {
  startDate: Date;
  endDate: Date;
}

export interface ExistingAppointment {
  startTime: Date;
  endTime: Date;
}

export interface AvailabilityOptions {
  date: Date;
  businessHours: BusinessHoursData[];
  blockedPeriods: BlockedPeriodData[];
  existingAppointments: ExistingAppointment[];
  serviceDuration: number; // minutes
  bufferMinutes?: number;  // minutes de tampon entre RDV
  minNoticeMinutes?: number; // préavis minimum en minutes
}

/**
 * Vérifie si une date tombe dans une période bloquée.
 */
function isDateBlocked(date: Date, blockedPeriods: BlockedPeriodData[]): boolean {
  const d = startOfDay(date);
  return blockedPeriods.some((period) => {
    const start = startOfDay(period.startDate);
    const end = startOfDay(period.endDate);
    return (
      (d >= start && d <= end)
    );
  });
}

/**
 * Génère des créneaux horaires à partir d'une plage d'ouverture.
 */
function generateSlots(
  openTime: string,
  closeTime: string,
  durationMinutes: number
): TimeSlot[] {
  const refDate = new Date(2000, 0, 1);
  const start = parse(openTime, "HH:mm", refDate);
  const end = parse(closeTime, "HH:mm", refDate);

  const slots: TimeSlot[] = [];
  let current = start;

  while (
    isBefore(addMinutes(current, durationMinutes), end) ||
    isEqual(addMinutes(current, durationMinutes), end)
  ) {
    const slotEnd = addMinutes(current, durationMinutes);
    slots.push({
      startTime: format(current, "HH:mm"),
      endTime: format(slotEnd, "HH:mm"),
      available: true,
    });
    current = slotEnd;
  }

  return slots;
}

/**
 * Marque les créneaux occupés par des rendez-vous existants.
 */
function markBookedSlots(
  slots: TimeSlot[],
  appointments: ExistingAppointment[],
  date: Date,
  bufferMinutes: number
): TimeSlot[] {
  const targetDate = startOfDay(date);

  const dayAppointments = appointments.filter(
    (a) => startOfDay(a.startTime).getTime() === targetDate.getTime()
  );

  if (dayAppointments.length === 0) return slots;

  return slots.map((slot) => {
    const slotStart = parse(slot.startTime, "HH:mm", targetDate);
    const slotEnd = parse(slot.endTime, "HH:mm", targetDate);
    const slotEndWithBuffer = addMinutes(slotEnd, bufferMinutes);

    const isBooked = dayAppointments.some((appt) => {
      const apptEndWithBuffer = addMinutes(appt.endTime, bufferMinutes);
      const overlap =
        isBefore(appt.startTime, slotEnd) &&
        isBefore(slotStart, apptEndWithBuffer);
      const newBufferOverlap =
        isBefore(slotStart, appt.startTime) &&
        isBefore(appt.startTime, slotEndWithBuffer);
      return overlap || newBufferOverlap;
    });

    return { ...slot, available: !isBooked };
  });
}

/**
 * Calcule les créneaux disponibles pour une date donnée.
 * Respecte les horaires, périodes bloquées, RDV existants, et le préavis minimum.
 */
export function getAvailableSlots({
  date,
  businessHours,
  blockedPeriods,
  existingAppointments,
  serviceDuration,
  bufferMinutes = 0,
  minNoticeMinutes = 60,
}: AvailabilityOptions): TimeSlot[] {
  const targetDate = startOfDay(date);
  const now = new Date();

  // Date dans le passé
  if (isBefore(targetDate, startOfDay(now))) return [];

  // Période bloquée (férié, congé, etc.)
  if (isDateBlocked(date, blockedPeriods)) return [];

  // Horaires d'ouverture pour ce jour de la semaine
  const dayOfWeek = getDay(date);
  const hours = businessHours.find((h) => h.dayOfWeek === dayOfWeek);

  if (!hours || !hours.isOpen) return [];

  // Générer tous les créneaux
  let slots = generateSlots(hours.openTime, hours.closeTime, serviceDuration);

  // Marquer les créneaux déjà réservés
  slots = markBookedSlots(slots, existingAppointments, date, bufferMinutes);

  // Filtrer les créneaux passés ou trop proches (préavis minimum)
  const minBookingTime = addMinutes(now, minNoticeMinutes);

  slots = slots.map((slot) => {
    const slotStart = parse(slot.startTime, "HH:mm", targetDate);
    if (isBefore(slotStart, minBookingTime)) {
      return { ...slot, available: false };
    }
    return slot;
  });

  return slots;
}

/**
 * Vérifie si un créneau spécifique est disponible.
 * Utilisé pour la validation côté serveur lors de la création d'un RDV.
 */
export function isSlotAvailable(
  startTime: Date,
  endTime: Date,
  existingAppointments: ExistingAppointment[],
  bufferMinutes: number = 0
): boolean {
  return !existingAppointments.some((appt) => {
    const apptEndWithBuffer = addMinutes(appt.endTime, bufferMinutes);
    const slotEndWithBuffer = addMinutes(endTime, bufferMinutes);
    return (
      (isBefore(appt.startTime, endTime) && isAfter(appt.endTime, startTime)) ||
      (isBefore(startTime, appt.startTime) && isAfter(slotEndWithBuffer, appt.startTime))
    );
  });
}

/**
 * Calcule la disponibilité pour une plage de dates (calendrier).
 */
export function getAvailabilitySummaryForRange(
  startDate: Date,
  endDate: Date,
  businessHours: BusinessHoursData[],
  blockedPeriods: BlockedPeriodData[],
  existingAppointments: ExistingAppointment[],
  serviceDuration: number,
  bufferMinutes: number = 0,
  minNoticeMinutes: number = 60
): Map<string, boolean> {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const result = new Map<string, boolean>();

  for (const day of days) {
    const slots = getAvailableSlots({
      date: day,
      businessHours,
      blockedPeriods,
      existingAppointments,
      serviceDuration,
      bufferMinutes,
      minNoticeMinutes,
    });
    const hasAvailability = slots.some((s) => s.available);
    result.set(format(day, "yyyy-MM-dd"), hasAvailability);
  }

  return result;
}
