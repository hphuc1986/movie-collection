import { useEffect, useState } from "react";
import { getMovies, type Movie } from "./services/api";
import { AuthForm } from "./components/AuthForm";

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication State Hooks
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const fetchCollection = async () => {
    try {
      const data = await getMovies();
      setMovies(Array.isArray(data) ? data : [data]);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(
        "Could not fetch collection records from the cloud serverless backend worker API.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check localStorage on component boot to keep current session active
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }

    fetchCollection();
  }, []);

  const handleAuthSuccess = (authenticatedUser: any, userToken: string) => {
    setUser(authenticatedUser);
    setToken(userToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <div
      style={{
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#121212",
        color: "#fff",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid #333",
          paddingBottom: "1rem",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ color: "#E50914", margin: 0 }}>🎬 CineStore Hub</h1>
          <p style={{ color: "#aaa", margin: "0.5rem 0 0" }}>
            Cross-Platform API-First Movie Store Ecosystem
          </p>
        </div>

        {/* Live User Session Identity Bar */}
        {user ? (
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                marginRight: "1rem",
                fontSize: "0.95rem",
                color: "#00bc8c",
              }}
            >
              👋 Welcome, <strong>{user.fullName}</strong>!
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.4rem 1rem",
                backgroundColor: "#333",
                color: "#fff",
                border: "1px solid #555",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <span style={{ fontSize: "0.9rem", color: "#aaa" }}>
            👤 Guest Session
          </span>
        )}
      </header>

      {/* Main Core View Grid Logic Split */}
      {!user ? (
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      ) : (
        <div>
          {loading && (
            <p style={{ color: "#007ACC" }}>
              🔄 Loading store showcase catalog arrays...
            </p>
          )}
          {error && (
            <div
              style={{
                backgroundColor: "#3a0d11",
                border: "1px solid #e50914",
                padding: "1rem",
                borderRadius: "4px",
                color: "#ffb3b3",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h2 style={{ fontSize: "1.25rem", margin: 0 }}>
                  🎥 Available Catalog Items ({movies.length})
                </h2>
                <div
                  style={{
                    backgroundColor: "#E50914",
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                  }}
                >
                  🛒 Shopping Cart: 0 items
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {movies.map((movie) => (
                  <div
                    key={movie.id}
                    style={{
                      backgroundColor: "#1e1e1e",
                      borderRadius: "8px",
                      padding: "1.5rem",
                      border: "1px solid #2d2d2d",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 0.5rem 0", color: "#fff" }}>
                        {movie.title}
                      </h3>
                      <p
                        style={{
                          margin: "0 0 0.25rem 0",
                          color: "#aaa",
                          fontSize: "0.9rem",
                        }}
                      >
                        📅 Release: {movie.releaseYear || "N/A"}
                      </p>
                      <p
                        style={{
                          margin: "0 0 0.5rem 0",
                          color: "#aaa",
                          fontSize: "0.9rem",
                        }}
                      >
                        💿 Format:{" "}
                        <span style={{ color: "#00bc8c", fontWeight: "bold" }}>
                          {movie.format || "Digital"}
                        </span>
                      </p>
                    </div>
                    <div
                      style={{
                        marginTop: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                          color: "#ffc107",
                        }}
                      >
                        $14.99
                      </span>
                      <button
                        style={{
                          padding: "0.4rem 0.8rem",
                          backgroundColor: "#00bc8c",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
