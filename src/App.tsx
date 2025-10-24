import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { ContactsProvider } from "./contexts/ContactsContext";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";

function App() {
  return (
    <AuthProvider>
      <ContactsProvider>
        <AnalyticsProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <AppRoutes />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#363636",
                    color: "#fff",
                  },
                }}
              />
            </div>
          </Router>
        </AnalyticsProvider>
      </ContactsProvider>
    </AuthProvider>
  );
}

export default App;
