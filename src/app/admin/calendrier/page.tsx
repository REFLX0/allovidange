import React from "react";
import { prisma } from "@/lib/prisma";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import type { Metadata } from "next";
import { SAMPLE_APPOINTMENTS } from "@/lib/sample-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Calendrier | ALLO VIDANGE" };

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  CONFIRMED: "#3B82F6",
  IN_PROGRESS: "#8B5CF6",
  COMPLETED: "#22C55E",
  CANCELLED: "#EF4444",
  NO_SHOW: "#6B7280",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Attente",
  CONFIRMED: "Confirmé",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
  NO_SHOW: "Absent",
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 07:00 to 18:00

interface SearchParams {
  date?: string;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const refDate = params.date ? new Date(params.date + "T00:00:00") : new Date();
  const weekStart = startOfWeek(refDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(refDate, { weekStartsOn: 1 });

  let appointments: any[] = [];

  try {
    appointments = await prisma.appointment.findMany({
      where: {
        date: { gte: weekStart, lte: weekEnd },
        status: { not: "CANCELLED" },
      },
      include: {
        customer: true,
        service: true,
      },
      orderBy: { startTime: "asc" },
    });
  } catch (err) {
    console.warn("DB offline on calendar, using sample data:", err);
  }

  // Fallback demo appointments if DB is offline or empty
  if (appointments.length === 0) {
    appointments = SAMPLE_APPOINTMENTS;
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const prevWeek = format(addDays(weekStart, -7), "yyyy-MM-dd");
  const nextWeek = format(addDays(weekStart, 7), "yyyy-MM-dd");
  const todayStr = format(new Date(), "yyyy-MM-dd");

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <div className="admin-page-title">Calendrier</div>
          <div className="admin-page-subtitle">
            Semaine du {format(weekStart, "d MMMM", { locale: fr })} au {format(weekEnd, "d MMMM yyyy", { locale: fr })}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href={`?date=${prevWeek}`} className="btn btn-ghost btn-sm">← Semaine préc.</Link>
          <Link href={`?date=${todayStr}`} className="btn btn-secondary btn-sm">Aujourd&apos;hui</Link>
          <Link href={`?date=${nextWeek}`} className="btn btn-ghost btn-sm">Semaine suiv. →</Link>
          <Link href="/admin/rendez-vous/nouveau" className="btn btn-primary btn-sm">+ Nouveau RDV</Link>
        </div>
      </div>

      {/* Week view */}
      <div style={{ overflowX: "auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "60px repeat(7, 1fr)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          minWidth: "700px",
        }}>
          {/* Header */}
          <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }} />
          {days.map((day) => {
            const isToday = format(day, "yyyy-MM-dd") === todayStr;
            return (
              <div key={day.toString()} style={{
                background: "var(--bg-surface)",
                borderBottom: "1px solid var(--border)",
                borderLeft: "1px solid var(--border-subtle)",
                padding: "10px 8px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {format(day, "EEE", { locale: fr })}
                </div>
                <div style={{
                  fontFamily: "var(--font-barlow, sans-serif)",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: isToday ? "var(--brand-red)" : "var(--text-primary)",
                  lineHeight: 1.2,
                  marginTop: "2px",
                }}>
                  {format(day, "d")}
                </div>
              </div>
            );
          })}

          {/* Time rows */}
          {HOURS.map((hour) => (
            <React.Fragment key={`hour-row-${hour}`}>
              <div style={{
                background: "var(--bg-surface)",
                borderTop: "1px solid var(--border-subtle)",
                padding: "8px 8px 0",
                fontSize: "11px",
                color: "var(--text-faint)",
                textAlign: "right",
                fontWeight: 600,
              }}>
                {String(hour).padStart(2, "0")}:00
              </div>
              {days.map((day) => {
                const dayStr = format(day, "yyyy-MM-dd");
                const dayAppts = appointments.filter((a) => {
                  const aDate = format(new Date(a.date), "yyyy-MM-dd");
                  const aHour = new Date(a.startTime).getHours();
                  return aDate === dayStr && aHour === hour;
                });
                const isToday = dayStr === todayStr;

                return (
                  <div key={`${day}-${hour}`} style={{
                    background: isToday ? "rgba(192,16,26,0.02)" : "var(--bg-primary)",
                    borderTop: "1px solid var(--border-subtle)",
                    borderLeft: "1px solid var(--border-subtle)",
                    padding: "4px",
                    minHeight: "48px",
                    position: "relative",
                  }}>
                    {dayAppts.map((appt) => (
                      <Link
                        key={appt.id}
                        href={`/admin/rendez-vous/${appt.id}`}
                        style={{
                          display: "block",
                          padding: "4px 6px",
                          borderRadius: "4px",
                          marginBottom: "2px",
                          background: STATUS_COLORS[appt.status] + "22",
                          borderLeft: `3px solid ${STATUS_COLORS[appt.status]}`,
                          textDecoration: "none",
                          fontSize: "11px",
                          lineHeight: 1.3,
                        }}
                      >
                        <div style={{ fontWeight: 700, color: STATUS_COLORS[appt.status] }}>
                          {format(new Date(appt.startTime), "HH:mm")}
                        </div>
                        <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "11px" }}>
                          {appt.customer?.name}
                        </div>
                        <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>
                          {appt.service?.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <div key={status} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: STATUS_COLORS[status] }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
