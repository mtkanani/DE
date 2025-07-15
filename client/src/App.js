import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import './index.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const CropAdvisory = lazy(() => import('./pages/CropAdvisory'));
const AdvisoryDetail = lazy(() => import('./pages/AdvisoryDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'));

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Layout Component
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Admin Layout Component
const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Admin Sidebar would go here */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              <Router>
                <div className="App">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route 
                        path="/" 
                        element={
                          <Layout>
                            <Home />
                          </Layout>
                        } 
                      />
                      
                      {/* Products Routes */}
                      <Route 
                        path="/products" 
                        element={
                          <Layout>
                            <Products />
                          </Layout>
                        } 
                      />
                      <Route 
                        path="/products/:id" 
                        element={
                          <Layout>
                            <ProductDetail />
                          </Layout>
                        } 
                      />
                      
                      {/* Cart & Checkout */}
                      <Route 
                        path="/cart" 
                        element={
                          <Layout>
                            <Cart />
                          </Layout>
                        } 
                      />
                      <Route 
                        path="/checkout" 
                        element={
                          <Layout>
                            <ProtectedRoute>
                              <Checkout />
                            </ProtectedRoute>
                          </Layout>
                        } 
                      />
                      
                      {/* Crop Advisory */}
                      <Route 
                        path="/advisory" 
                        element={
                          <Layout>
                            <CropAdvisory />
                          </Layout>
                        } 
                      />
                      <Route 
                        path="/advisory/:id" 
                        element={
                          <Layout>
                            <AdvisoryDetail />
                          </Layout>
                        } 
                      />
                      
                      {/* Information Pages */}
                      <Route 
                        path="/about" 
                        element={
                          <Layout>
                            <About />
                          </Layout>
                        } 
                      />
                      <Route 
                        path="/contact" 
                        element={
                          <Layout>
                            <Contact />
                          </Layout>
                        } 
                      />
                      
                      {/* Auth Routes */}
                      <Route 
                        path="/login" 
                        element={
                          <PublicRoute>
                            <Login />
                          </PublicRoute>
                        } 
                      />
                      <Route 
                        path="/register" 
                        element={
                          <PublicRoute>
                            <Register />
                          </PublicRoute>
                        } 
                      />
                      <Route 
                        path="/forgot-password" 
                        element={
                          <PublicRoute>
                            <ForgotPassword />
                          </PublicRoute>
                        } 
                      />
                      
                      {/* Protected User Routes */}
                      <Route 
                        path="/profile" 
                        element={
                          <Layout>
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          </Layout>
                        } 
                      />
                      <Route 
                        path="/orders" 
                        element={
                          <Layout>
                            <ProtectedRoute>
                              <Orders />
                            </ProtectedRoute>
                          </Layout>
                        } 
                      />
                      <Route 
                        path="/orders/:id" 
                        element={
                          <Layout>
                            <ProtectedRoute>
                              <OrderDetail />
                            </ProtectedRoute>
                          </Layout>
                        } 
                      />
                      
                      {/* Admin Routes */}
                      <Route 
                        path="/admin" 
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminLayout>
                              <AdminDashboard />
                            </AdminLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/products" 
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminLayout>
                              <AdminProducts />
                            </AdminLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/orders" 
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminLayout>
                              <AdminOrders />
                            </AdminLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/users" 
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminLayout>
                              <AdminUsers />
                            </AdminLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/analytics" 
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminLayout>
                              <AdminAnalytics />
                            </AdminLayout>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/coupons" 
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminLayout>
                              <AdminCoupons />
                            </AdminLayout>
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* 404 Route */}
                      <Route 
                        path="*" 
                        element={
                          <Layout>
                            <NotFound />
                          </Layout>
                        } 
                      />
                    </Routes>
                  </Suspense>
                  
                  {/* Global Toast Notifications */}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#ffffff',
                        color: '#374151',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      },
                      success: {
                        iconTheme: {
                          primary: '#22c55e',
                          secondary: '#ffffff'
                        }
                      },
                      error: {
                        iconTheme: {
                          primary: '#ef4444',
                          secondary: '#ffffff'
                        }
                      }
                    }}
                  />
                </div>
              </Router>
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;