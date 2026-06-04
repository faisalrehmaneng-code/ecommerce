import React from 'react';
import ReactDOM from 'react-dom/client';
import '../node_modules/font-awesome/css/font-awesome.min.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Layout from './Layouts/Layout';
import {
  Home,
  Product,
  Products,
  AboutPage,
  ContactPage,
  Cart,
  Login,
  // Register,
  Checkout,
  PageNotFound,
  // MerchantDashboard,
  ShippingPage,
  SellWithUs,
  AccountDetails,
  OrderPage,
  OrderPlaced
  // TrackOrder,
  // OrderDetails
} from './pages';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AdminLayout from './admin';
import WhatsappButton from './components/WhatsappButton';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import ReactPixel from 'react-facebook-pixel';

const options = {
  autoConfig: true, 
  debug: false,    
};

ReactPixel.init('1420203502948138', options);
ReactPixel.pageView();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <ScrollToTop>
      <Provider store={store}>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route
              path='/admin/login'
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            {/* <Route
              path='/register'
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            /> */}
            <Route path='/auth/success' element={<GoogleAuthSuccess />} />
            <Route index element={<Home />} />
            <Route path='/product' element={<Products />} />
            <Route path='/product/:id' element={<Product />} />
            <Route path='/about' element={<AboutPage />} />
            <Route path='/contact' element={<ContactPage />} />
            <Route path='/shipping' element={<ShippingPage />} />
            <Route path='/sell' element={<SellWithUs />} />
            <Route path='/account-details' element={<AccountDetails />} />
            <Route path='/orders' element={<OrderPage />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/order-placed' element={<OrderPlaced />} />
            {/* <Route
              path='/order/:id'
              element={
                <PublicRoute>
                  <OrderDetails />
                </PublicRoute>
              }
            /> */}
            <Route
              path='/order/track/:id'
              element={<PublicRoute>{/* <TrackOrder /> */}</PublicRoute>}
            />
            <Route
              path='/checkout'
              element={
                // <PublicRoute>
                <Checkout />
                // </PublicRoute>
              }
            />
          </Route>

          <Route
            path='/admin/*'
            element={
              <ProtectedRoute rolesAllowed={['ROLE ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          />
          {/* other routes */}

          <Route
            path='/merchant'
            element={
              <ProtectedRoute rolesAllowed={['ROLE MERCHANT']}>
                {/* <MerchantDashboard /> */}
              </ProtectedRoute>
            }
          />

          <Route path='*' element={<PageNotFound />} />
          <Route path='/product/*' element={<PageNotFound />} />
        </Routes>
      </Provider>
    </ScrollToTop>
    <Toaster />
    <div>
      <WhatsappButton />
    </div>
  </BrowserRouter>
);
