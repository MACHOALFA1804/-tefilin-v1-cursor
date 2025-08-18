import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  email: string;
  password: string;
  role: "admin" | "pastor" | "recepcionista";
}

const LoginDashboard: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const users: User[] = [
    { email: "admin@igreja.com", password: "123456", role: "admin" },
    { email: "pastor@igreja.com", password: "123456", role: "pastor" },
    { email: "recepcao@igreja.com", password: "123456", role: "recepcionista" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

  const handleLogin = () => {
    const user = users.find(
      (u) =>
        u.email === credentials.email && u.password === credentials.password
    );

    if (user) {
      setCredentials({ email: "", password: "" });
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "pastor") {
        navigate("/pastor");
      } else {
        navigate("/recepcao");
      }
    } else {
      alert("Email ou senha incorretos!");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "280px",
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "20px",
    border: "1px solid rgba(34, 211, 238, 0.3)",
    boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.25)",
  };

  const logoStyle: React.CSSProperties = {
    width: "50px",
    height: "50px",
    backgroundColor: "#22d3ee",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
    boxShadow: "0 6px 16px rgba(34, 211, 238, 0.3)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "22px",
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: "6px",
    letterSpacing: "0.5px",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#94a3b8",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: "16px",
  };

  const verseBoxStyle: React.CSSProperties = {
    backgroundColor: "rgba(51, 65, 85, 0.4)",
    borderRadius: "10px",
    padding: "12px",
    border: "1px solid rgba(34, 211, 238, 0.2)",
    marginBottom: "16px",
  };

  const verseTextStyle: React.CSSProperties = {
    color: "#22d3ee",
    fontSize: "11px",
    fontWeight: "500",
    lineHeight: "1.4",
    textAlign: "center",
    marginBottom: "4px",
  };

  const verseRefStyle: React.CSSProperties = {
    color: "rgba(34, 211, 238, 0.7)",
    fontSize: "9px",
    textAlign: "center",
    fontWeight: "500",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "white",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "6px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    backgroundColor: "rgba(51, 65, 85, 0.5)",
    border: "1px solid rgba(34, 211, 238, 0.3)",
    borderRadius: "10px",
    color: "white",
    fontSize: "13px",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    backgroundColor: "#22d3ee",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 10px rgba(34, 211, 238, 0.2)",
    marginTop: "16px",
  };

  const footerStyle: React.CSSProperties = {
    textAlign: "center",
    marginTop: "16px",
  };

  const devTextStyle: React.CSSProperties = {
    color: "#22d3ee",
    fontSize: "10px",
    fontWeight: "bold",
    letterSpacing: "1px",
  };

  const credentialsStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "12px",
    right: "12px",
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    backdropFilter: "blur(10px)",
    borderRadius: "10px",
    padding: "8px",
    border: "1px solid rgba(71, 85, 105, 0.5)",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.25)",
    maxWidth: "200px",
  };

  const credentialsTitleStyle: React.CSSProperties = {
    color: "#94a3b8",
    fontSize: "8px",
    fontWeight: "600",
    marginBottom: "4px",
  };

  const credentialsListStyle: React.CSSProperties = {
    fontSize: "8px",
    color: "#64748b",
    lineHeight: "1.3",
  };

  return (
    <div style={containerStyle}>
      <div style={{ width: "100%", maxWidth: "280px" }}>
        <div style={cardStyle}>
          {/* Logo */}
          <div style={logoStyle}>
            <svg width="24" height="24" fill="#0f172a" viewBox="0 0 24 24">
              <path d="M10.5 2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2zM12 6a.5.5 0 0 1 .5.5v1h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H10a.5.5 0 0 1-.5-.5V8a.5.5 0 0 1 .5-.5h1v-1A.5.5 0 0 1 12 6z" />
              <path d="M2 13.692V16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2.308l-8-2.667-8 2.667zM4 9v2.692l8-2.667L20 11.692V9a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z" />
            </svg>
          </div>

          <h1 style={titleStyle}>TEFILIN v1</h1>
          <p style={subtitleStyle}>Assembleia de Deus Vila Evangélica</p>

          {/* Bible Verse */}
          <div style={verseBoxStyle}>
            <p style={verseTextStyle}>
              "E tudo quanto fizerdes, fazei-o de todo o coração, como ao
              Senhor"
            </p>
            <p style={verseRefStyle}>Colossenses 3:23</p>
          </div>

          {/* Login Form */}
          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>E-mail</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="seu@email.com"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "#22d3ee";
                e.target.style.boxShadow = "0 0 0 2px rgba(34, 211, 238, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(34, 211, 238, 0.3)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Senha</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "#22d3ee";
                e.target.style.boxShadow = "0 0 0 2px rgba(34, 211, 238, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(34, 211, 238, 0.3)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            onClick={handleLogin}
            style={buttonStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#06b6d4";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#22d3ee";
            }}
          >
            Entrar no Sistema
          </button>
        </div>

        <div style={footerStyle}>
          <p style={devTextStyle}>DEV EMERSON 2025</p>
        </div>
      </div>

      {/* Credentials Panel */}
      <div style={credentialsStyle}>
        <p style={credentialsTitleStyle}>Credenciais para teste:</p>
        <div style={credentialsListStyle}>
          <p>• Admin: admin@igreja.com / 123456</p>
          <p>• Pastor: pastor@igreja.com / 123456</p>
          <p>• Recepção: recepcao@igreja.com / 123456</p>
        </div>
      </div>
    </div>
  );
};

export default LoginDashboard;
