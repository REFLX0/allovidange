export default function AdminLoading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div style={{
          width: "36px", height: "36px",
          border: "3px solid var(--border)",
          borderTopColor: "var(--brand-red)",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite"
        }} />
        <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Chargement...</div>
      </div>
    </div>
  );
}
