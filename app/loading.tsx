export default function Loading() {
  return (
    <div style={{
      width: "100%",
      height: "100vh",
      background: "linear-gradient(45deg, #000011, #001122, #000011)",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
    }}>
      <div style={{
        width: "50px",
        height: "50px",
        border: "5px solid #fff",
        borderTop: "5px solid #FFD700",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "20px"
      }}></div>
      <div style={{
        animation: "pulse 2s infinite",
        marginBottom: "20px"
      }}>Loading Christmas Scene...</div>
      <div style={{ fontSize: "18px", marginTop: "10px" }}>🎄❄️</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}