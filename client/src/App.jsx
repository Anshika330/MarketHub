import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './components/home/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminVendorsPage from './pages/AdminVendorsPage';
import LoginPage from './pages/LoginPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import SignupPage from './pages/SignupPage';
import ShopPage from './pages/ShopPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import VendorOrdersPage from './pages/VendorOrdersPage';
import VendorProductsPage from './pages/VendorProductsPage';
import VendorPendingPage from './pages/VendorPendingPage';
import RouteGuard from './components/common/RouteGuard';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function PlaceholderPage({ title }) {
  return (
    <section className="placeholder-page container">
      <p className="eyebrow">MarketHub</p>
      <h1>{title}</h1>
      <p>This page is ready for future marketplace content.</p>
    </section>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/products/:id" element={<ProductDetailsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/checkout"
                element={
                  <RouteGuard role="Customer">
                    <CheckoutPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/orders"
                element={
                  <RouteGuard role="Customer">
                    <MyOrdersPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/orders/:orderId/confirmation"
                element={
                  <RouteGuard role="Customer">
                    <OrderConfirmationPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/vendor/dashboard"
                element={
                  <RouteGuard role="Vendor">
                    <VendorDashboardPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/vendor/products"
                element={
                  <RouteGuard role="Vendor">
                    <VendorProductsPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/vendor/orders"
                element={
                  <RouteGuard role="Vendor">
                    <VendorOrdersPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/vendor/pending"
                element={
                  <RouteGuard role="Vendor">
                    <VendorPendingPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <RouteGuard role="Admin">
                    <AdminDashboardPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/admin/vendors"
                element={
                  <RouteGuard role="Admin">
                    <AdminVendorsPage />
                  </RouteGuard>
                }
              />
              <Route
                path="/unauthorized"
                element={
                  <PlaceholderPage title="You do not have access to this page" />
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
