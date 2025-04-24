import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./Routes";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import SeedData from "./pages/SeedData";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto py-6 px-4">
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Data Seed Route (Admin Only) */}
                <Route path="/admin/seed" element={
                  <ProtectedRoute>
                    <SeedData />
                  </ProtectedRoute>
                } />
                
                {/* Default Routes */}
                <Route path="/*" element={<AppRoutes />} />
              </Routes>
            </main>
          </div>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
