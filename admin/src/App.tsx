import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Testimonials from "./pages/Testimonials";
import Blogs from "./pages/Blogs";
import BlogForm from "./pages/BlogForm";
import Contact from "./pages/Contact";
import HeroSlides from "./pages/HeroSlides";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="users" element={<Users />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="hero-slides" element={<HeroSlides />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blogs/new" element={<BlogForm />} />
            <Route path="blogs/:id" element={<BlogForm />} />
            <Route path="contact" element={<Contact />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
