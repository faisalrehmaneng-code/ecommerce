import React, { useState, useEffect } from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import { RxHamburgerMenu } from 'react-icons/rx';
import { IoMdClose } from 'react-icons/io';
import Dashboard from './Dashboard';
import { Navbar } from '../components';
import Account from './Account';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';
import ProductList from './ProductList';
import CategoryList from './CategoryList';
import AddCategory from './AddCategory';
import EditCategory from './EditCategory';
import ReviewList from './ReviewList';
import ShippingPolicy from './ShippingPolicy';
import Banner from './Banner';
import CustomShipping from './customShipping';
import Promocard from './Promocard';
import UserList from './UserList';
import Order from './Order';
import BankDetails from './BankDetails';
import AdminStoreDiscount from './AdminStoreDiscount';
// Example: get user from localStorage
const getUser = () => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
};

const AdminLayout = () => {
  const user = getUser(); // { role: 'ROLE ADMIN' } or 'ROLE MERCHANT'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define sidebar links based on role
  let sidebarLinks = [
    // { name: 'My Account', path: '/admin/account' },
    { name: 'Categories', path: '/admin/categories' },
    // { name: 'Address', path: '/admin/address' },
    { name: 'Products', path: '/admin/products' },
    // { name: 'Users', path: '/admin/user' },
    // { name: 'Orders', path: '/admin/orders' },
    { name: 'Reviews', path: '/admin/reviews' },
    { name: 'Shipping Policy', path: '/admin/shipping-policy' },
    { name: 'Banner', path: '/admin/banner' },
    { name: 'Promocard', path: '/admin/promocard' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Custom Shipping', path: '/admin/custom-shipping' },
    { name: 'Bank Details', path: '/admin/bank-details' },
    { name: 'Store Discount', path: '/admin/store-discount' }
    // { name: 'WishList', path: '/admin/wishlist' },
    // { name: 'Support', path: '/admin/support' }
  ];

  if (user?.role === 'ROLE ADMIN') {
    sidebarLinks.unshift({ name: 'Dashboard', path: '/admin' });
  } else if (user?.role === 'ROLE MERCHANT') {
    sidebarLinks.unshift({ name: 'Merchant Dashboard', path: '/admin' });
  }

  return (
    <div className='admin-layout d-flex flex-column vh-100'>
      <Navbar />

      <div className='main-layout d-flex flex-grow-1 justify-content-center position-relative'>
        <div className='container-layout d-flex w-100'>
          {/* Mobile Toggle Button */}
          {isMobile && (
            <button
              className='btn btn-light position-absolute top-0 start-0 m-3 shadow-sm border'
              style={{ zIndex: 1000 }}
              onClick={() => setIsDrawerOpen(true)}
            >
              <RxHamburgerMenu size={24} />
            </button>
          )}

          {/* Overlay */}
          {isMobile && isDrawerOpen && (
            <div
              className='position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50'
              style={{ zIndex: 1040 }}
              onClick={() => setIsDrawerOpen(false)}
            />
          )}

          {/* ===== Sidebar ===== */}
          <div
            className={`sidebar bg-light text-dark p-0 shadow ${
              isMobile ? 'mobile-drawer' : ''
            } ${isDrawerOpen ? 'open' : ''}`}
            style={{
              border: '1px solid #d4b86a',
              position: 'relative',
              zIndex: 1050
            }}
          >
            {!isMobile && (
              <div
                className='p-3 py-3 bg-dark text-white fw-bold'
                style={{
                  position: 'sticky',
                  top: '0px',
                  left: '0px',
                  right: '0px'
                }}
              >
                Bagsverse
              </div>
            )}
            {isMobile && (
              <div className='d-flex justify-content-between align-items-center p-3 border-bottom'>
                <h5 className='mb-0'>Menu</h5>
                <button
                  className='btn btn-sm btn-light'
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <IoMdClose size={24} />
                </button>
              </div>
            )}
            <ul className='nav flex-column gap-2 gap-md-0 justify-content-start p-3 p-md-0'>
              {sidebarLinks.map((link, index) => (
                <li key={index} className='nav-item mb-0 sidebar-item'>
                  <NavLink
                    to={link.path}
                    end
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active-link' : ''}`
                    }
                    onClick={() => isMobile && setIsDrawerOpen(false)}
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== Content ===== */}
          <div
            className='content flex-grow-1 p-3'
            style={isMobile ? { marginTop: '50px' } : {}}
          >
            <Routes>
              {user?.role === 'ROLE ADMIN' && (
                <>
                  <Route path='/' element={<Dashboard />} />
                  <Route path='/add-product' element={<AddProduct />} />
                  <Route path='/product/:id' element={<EditProduct />} />
                  <Route path='/products' element={<ProductList />} />
                  <Route path='/categories' element={<CategoryList />} />
                  <Route path='/add-category' element={<AddCategory />} />
                  <Route path='/category/:id' element={<EditCategory />} />
                  <Route path='/reviews' element={<ReviewList />} />
                  <Route path='/shipping-policy' element={<ShippingPolicy />} />
                  <Route path='/banner' element={<Banner />} />
                  <Route path='/promocard' element={<Promocard />} />
                  <Route path='/user' element={<UserList />} />
                  <Route path='/orders' element={<Order />} />
                  <Route path='/custom-shipping' element={<CustomShipping />} />
                  <Route path='/bank-details' element={<BankDetails />} />
                  <Route
                    path='/store-discount'
                    element={<AdminStoreDiscount />}
                  />
                </>
              )}
              {user?.role === 'ROLE MERCHANT' && (
                <Route path='/' element={<Dashboard />} />
              )}
              <Route path='account' element={<Account />} />
            </Routes>
          </div>
        </div>
      </div>

      {/* ===== Inline CSS ===== */}
      <style>{`
        .admin-layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
        }

        .main-layout {
          display: flex;
          flex-grow: 1;
          width: 100%;
          overflow: hidden;
          padding: 20px;
        }

        .container-layout {
          display: flex;
          width: 100%;
          max-width: 1200px;
          background-color: transparent;
        }

        .sidebar {
          flex: 0 0 0;
          min-width: 200px;
          max-width: 260px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        @media (min-width: 768px) {
          .sidebar {
            overflow-y: auto;
            
          }
          .sidebar::-webkit-scrollbar {
            width:0px;
          }
        }
        
        .sidebar-item {
          background-color: #fff;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          margin-bottom: 10px;
          transition: all 0.3s;
        }

        .sidebar-item:hover {
          background-color: #f1f3f5;
        }

        .nav-link {
          display: block;
          padding: 12px 16px;
          color: #343a40;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.3s, color 0.3s;
        }

        .nav-link.active-link {
          background-color: #d4b86a;
          color: #fff !important;
          border-radius: 0px;
        }

        .content {
          flex-grow: 1;
          margin-left: 20px;
          overflow-y: auto;
          min-width: 0;
        }

        .content::-webkit-scrollbar {
          width: 0px;
        }

        @media (max-width: 1200px) {
          .container-layout {
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .container-layout {
            flex-direction: column;
          }

          .sidebar {
            display: none;
          }

          .sidebar.mobile-drawer {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 280px;
            max-width: 80vw;
            z-index: 1050;
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
            margin: 0;
            border-radius: 0;
            overflow-y: auto;
          }

          .sidebar.mobile-drawer.open {
            transform: translateX(0);
          }

          .content {
            width: 100%;
            margin-left: 0;
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
