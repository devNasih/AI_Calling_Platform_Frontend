import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { ContactsProvider } from "./contexts/ContactsContext";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import { KnowledgeBaseProvider } from "./contexts/KnowledgeBaseContext";
import { CampaignProvider } from "./contexts/CampaignContext";
import { OutboundCallsProvider } from "./contexts/OutboundCallsContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ContactsProvider>
          <AnalyticsProvider>
            <KnowledgeBaseProvider>
              <DashboardProvider>
                <CampaignProvider>
                  <OutboundCallsProvider>
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
                  </OutboundCallsProvider>
                </CampaignProvider>
              </DashboardProvider>
            </KnowledgeBaseProvider>
          </AnalyticsProvider>
        </ContactsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
