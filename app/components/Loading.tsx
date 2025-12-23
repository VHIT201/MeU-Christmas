export default function Loading() {
  return (
    <div style={{
      width: "100%",
      height: "100vh",
      background: "linear-gradient(135deg, #0c1445, #1a1a2e, #16213e, #0f3460)",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Snowflakes */}
      <div className="snowflake" style={{ left: "10%", animationDelay: "0s" }}>❄️</div>
      <div className="snowflake" style={{ left: "20%", animationDelay: "1s" }}>❄️</div>
      <div className="snowflake" style={{ left: "30%", animationDelay: "2s" }}>❄️</div>
      <div className="snowflake" style={{ left: "40%", animationDelay: "0.5s" }}>❄️</div>
      <div className="snowflake" style={{ left: "50%", animationDelay: "1.5s" }}>❄️</div>
      <div className="snowflake" style={{ left: "60%", animationDelay: "2.5s" }}>❄️</div>
      <div className="snowflake" style={{ left: "70%", animationDelay: "0.8s" }}>❄️</div>
      <div className="snowflake" style={{ left: "80%", animationDelay: "1.2s" }}>❄️</div>
      <div className="snowflake" style={{ left: "90%", animationDelay: "1.8s" }}>❄️</div>

      <div style={{
        width: "60px",
        height: "60px",
        border: "6px solid #FFD700",
        borderTop: "6px solid #FF0000",
        borderRight: "6px solid #00FF00",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "20px",
        position: "relative",
        zIndex: 1,
      }}></div>
      <div style={{
        animation: "pulse 2s infinite",
        marginBottom: "20px",
        textAlign: "center",
        zIndex: 1,
      }}>
        <div>🎄 Merry Christmas Loading... 🎄</div>
      </div>
      <div style={{ fontSize: "18px", marginTop: "10px", zIndex: 1 }}>❄️✨🎁</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .snowflake {
          position: absolute;
          top: -10px;
          font-size: 24px;
          animation: fall 10s linear infinite;
          z-index: 0;
        }
        @keyframes fall {
          0% { transform: translateY(-10px); opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}