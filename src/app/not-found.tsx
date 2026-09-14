import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base, #0d0e12)",
        color: "var(--text-primary, #f1f3f7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "var(--font-sans, sans-serif)",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          background: "var(--bg-surface, #14161d)",
          border: "1px solid var(--border, #262a36)",
          borderRadius: "16px",
          padding: "48px 32px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ marginBottom: "20px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <Image
            src="/logo.png"
            alt="ALLO VIDANGE"
            width={44}
            height={44}
            style={{ borderRadius: "8px" }}
          />
          <span style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "0.06em", color: "#fff" }}>
            ALLO VIDANGE
          </span>
        </div>

        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: "var(--brand-red, #E62020)",
            lineHeight: 1,
            marginBottom: "12px",
            fontFamily: "var(--font-heading, sans-serif)",
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px", color: "#fff" }}>
          Page non trouvée
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted, #8b92a5)", lineHeight: 1.6, marginBottom: "32px" }}>
          La page que vous recherchez n&apos;existe pas, a été déplacée ou est temporairement indisponible.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/admin"
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            Tableau de bord admin
          </Link>
          <Link
            href="/"
            className="btn btn-secondary"
            style={{ textDecoration: "none" }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
