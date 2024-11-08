import { useState, useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { random_game_icp_01_backend } from 'declarations/game-backend';

function App() {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userChoice, setUserChoice] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const choices = ['Rock', 'Paper', 'Scissors'];

  // Initialize AuthClient
  useEffect(() => {
    const initAuth = async () => {
      const client = await AuthClient.create();
      setAuthClient(client);
      const isAuthed = await client.isAuthenticated();
      setIsAuthenticated(isAuthed);
    };
    initAuth();
  }, []);

  const login = async () => {
    if (!authClient) return;
    setLoading(true);

    await new Promise((resolve, reject) => {
      authClient.login({
        identityProvider: "https://identity.ic0.app",
        onSuccess: () => {
          setIsAuthenticated(true);
          setLoading(false);
          resolve(null);
        },
        onError: () => {
          setLoading(false);
          reject();
        },
      });
    });
  };

  const logout = async () => {
    if (!authClient) return;
    setLoading(true);
    await authClient.logout();
    setIsAuthenticated(false);
    setLoading(false);
  };

  const playGame = async (userSelection) => {
    setUserChoice(userSelection);
    setLoading(true);

    try {
      const response = await random_game_icp_01_backend.play_rps(userSelection);
      setResult(response);
    } catch (error) {
      setResult("Failed to play the game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>✊ Rock Paper Scissors Game</h1>
        {isAuthenticated ? (
          <button onClick={logout} className="auth-button" disabled={loading}>
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        ) : (
          <button onClick={login} className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login with Internet Identity'}
          </button>
        )}
      </header>

      {isAuthenticated ? (
        <div className="game-container">
          <h2>Choose Your Move</h2>
          <div className="choices">
            {choices.map((choice) => (
              <button
                key={choice}
                onClick={() => playGame(choice)}
                disabled={loading}
              >
                {choice}
              </button>
            ))}
          </div>
          <section className="result-section">
            {loading ? (
              <p>Loading...</p>
            ) : (
              result && <p>{result}</p>
            )}
          </section>
        </div>
      ) : (
        <div className="auth-prompt">
          <p>Please login with Internet Identity to access the game.</p>
        </div>
      )}
    </main>
  );
}

export default App;
