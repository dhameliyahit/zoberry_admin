import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import CategoryForm from "./pages/CategoryForm";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Users from "./pages/Users";
import Orders from "./pages/Orders";
import HeroVideos from "./pages/HeroVideos";
import PaymentSettings from "./pages/PaymentSettings";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="categories" element={<Categories />} />
            <Route path="categories/add" element={<CategoryForm />} />
            <Route path="categories/edit/:id" element={<CategoryForm />} />
            <Route path="products" element={<Products />} />
            <Route path="products/add" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="hero-videos" element={<HeroVideos />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
          <Route path="payment-settings" element={<PaymentSettings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
