import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/action/userAction';
import { addCart, delCart } from '../redux/action';
import { fetchCategories, searchProducts, fetchAllOrders, fetchMyOrders, markOrderAsRead } from '../api';
import { GoSearch } from 'react-icons/go';
import { FiUser, FiBell } from 'react-icons/fi';
import { RiShoppingCartLine } from 'react-icons/ri';
import { RxHamburgerMenu } from 'react-icons/rx';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const cartItems = useSelector(state => state.handleCart);
  const user = useSelector(state => state.handleUser.user);

  // UI States
  const [userDropdown, setUserDropdown] = useState(false);
  const [cartSidebar, setCartSidebar] = useState(false);
  const [searchDrawer, setSearchDrawer] = useState(false);
  const [categoryDrawer, setCategoryDrawer] = useState(false);
  const [notificationDropdown, setNotificationDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  // Data States
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- 1. RESIZE HANDLER ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 2. FETCH CATEGORIES ---
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategories();
        if (Array.isArray(res)) setCategories(res);
        else if (Array.isArray(res?.data)) setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    loadCategories();
  }, []);

  // --- 3. FETCH NOTIFICATIONS ---
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      let data;
      let unreadOrders = [];

      if (user.role === 'ROLE ADMIN') {
        const response = await fetchAllOrders();
        data = response.orders || response || [];
        unreadOrders = data.filter(order => order.adminRead === false);
      } else {
        const response = await fetchMyOrders();
        // filter whose status is not equal to  'Processing'
        // data = await response.filter(order => order.status !== 'Processing');
        data = response.orders || response || [];
        unreadOrders = data.filter(order => order.userRead === false);
      }

      setNotifications(unreadOrders);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 2000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // --- 4. HANDLE NOTIFICATION CLICK ---
  const handleNotificationClick = async (orderId) => {
    setNotifications(prev => prev.filter(order => order._id !== orderId));
    setNotificationDropdown(false);
    console.log("Marking order as read:", orderId, "for user role:", user.role);
    await markOrderAsRead(orderId, user.role);

    if (user.role === 'ROLE ADMIN') {
      navigate('/admin/orders', { state: { highlightId: orderId } });
    } else {
      navigate(`/order/${orderId}`);
    }
  };

  // --- SEARCH LOGIC ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setIsSearching(true);
        try {
          const results = await searchProducts(searchTerm);
          setSearchResults(results);
        } catch (error) {
          console.error("Search Error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSuggestionClick = (productId) => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchDrawer(false);
    navigate(`/product/${productId}`);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Close Overlays
  const handleOverlayClick = () => {
    setCartSidebar(false);
    setUserDropdown(false);
    setCategoryDrawer(false);
    // Notification dropdown is handled separately by the transparent backdrop
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setUserDropdown(false);
    navigate('/admin/login');
  };

  return (
    <>
      {/* MAIN NAVBAR - Sticky */}
      <nav
        className='navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top'
        style={{ top: 0, zIndex: 1030 }}
      >
        <div className='container d-flex align-items-center justify-content-between'>
          {/* LOGO */}
          <NavLink className='navbar-brand d-flex align-items-center pl-2 pl-md-0 px-md-3 m-0' to='/'>
            <img src='/assets/2-removebg-preview.png' alt='BagVerse' className='BagVerseimage' style={{ width: '120px', marginRight: '0px', objectFit: 'contain' }} />
          </NavLink>

          {/* DESKTOP SEARCH BAR */}
          {!isMobile && (
            <div className='d-flex flex-grow-1 mx-3 position-relative'>
              <div className='input-group w-100 shadow-sm rounded-pill overflow-hidden border'>
                <input type='text' className='form-control border-0 ps-4 py-2' placeholder='Search for products...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <button className='btn btn-dark px-3'>
                  {isSearching ? <i className='fa fa-spinner fa-spin text-white'></i> : <i className='fa fa-search text-white'></i>}
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="position-absolute w-100 bg-white shadow rounded-3 overflow-hidden" style={{ top: '100%', marginTop: '5px', zIndex: 1100, border: '1px solid #eee' }}>
                  <ul className="list-group list-group-flush text-start">
                    {searchResults.map((prod) => (
                      <li key={prod._id || prod.id} className="list-group-item list-group-item-action cursor-pointer px-3 py-2 d-flex align-items-center" onClick={() => handleSuggestionClick(prod._id || prod.id)} style={{ cursor: 'pointer' }}>
                        <img src={prod.images && prod.images.length > 0 ? prod.images[0].imageUrl : "https://via.placeholder.com/40"} alt={prod.name} style={{ width: '40px', height: '40px', objectFit: 'contain', marginRight: '15px', border: '1px solid #f0f0f0', borderRadius: '4px' }} />
                        <div><div className="fw-bold text-dark" style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>{prod.name}</div><div className="text-muted small">Rs {prod.price}</div></div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ICONS AREA */}
          <div className='d-flex align-items-center'>
            {isMobile && (
              <button className='btn nav-icon' style={{ border: 'none', background: 'transparent', fontSize: '2rem' }} onClick={() => setSearchDrawer(true)}>
                <GoSearch />
              </button>
            )}

            {/* --- NOTIFICATION BELL --- */}
            {user && (
              <div className='position-relative'>
                <button
                  className='btn no-focus nav-icon'
                  style={{ border: 'none', background: 'transparent', fontSize: '2rem' }}
                  onClick={() => setNotificationDropdown(!notificationDropdown)}
                >
                  <FiBell />
                  {notifications.length > 0 && (
                    <span className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger' style={{ fontSize: '0.6rem', marginTop: '10px', marginLeft: '-15px' }}>
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationDropdown && (
                  <>
                    {/* Transparent Backdrop to close dropdown when clicking outside */}
                    <div
                      className="position-fixed top-0 start-0 w-100 h-100"
                      style={{ zIndex: 1055, cursor: 'default' }}
                      onClick={() => setNotificationDropdown(false)}
                    ></div>

                    {/* The Dropdown */}
                    <div className="position-absolute bg-white shadow-lg rounded-3 border scrollbar-turnovers" style={{ top: '100%', left: '50%', transform: 'translateX(-50%)', width: '270px', zIndex: 1100, maxHeight: '200px', overflowY: 'auto' }}>
                      <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold">Notifications</h6>
                        <small className="text-muted">{notifications.length} new</small>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted small">No new notifications</div>
                      ) : (
                        <ul className="list-group list-group-flush">
                          {notifications.map((order) => {
                            const customerName = order.user?.firstName || (order.shippingAddress ? order.shippingAddress.firstName : "Customer");
                            const email = order.user?.email || (order.shippingAddress ? order.shippingAddress.email : "");
                            const status = order.status || "Pending";
                            const date = new Date(order.created).toLocaleDateString();

                            return (
                              <li
                                key={order._id}
                                className="list-group-item list-group-item-action p-3 cursor-pointer"
                                style={{ cursor: 'pointer', borderLeft: '3px solid #d4b86a' }}
                                onClick={() => handleNotificationClick(order._id)}
                              >
                                <div className="d-flex justify-content-between mb-1">
                                  <span className="fw-bold small text-dark">Order #{order._id.substring(0, 6).toUpperCase()}</span>
                                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>{date}</small>
                                </div>
                                <p className="mb-0 small text-dark">
                                  order by <strong>{customerName}</strong>
                                </p>
                                {status && <small className="text-muted d-block">{status}</small>}
                                <div className="mt-1 small fw-bold text-primary">Rs {order.total.toLocaleString()}</div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* USER DROPDOWN */}
            <div className='position-relative'>
              {
                user?.role === 'ROLE ADMIN' && (
                  <button className='btn no-focus nav-icon' style={{ border: 'none', background: 'transparent', fontSize: '2rem' }} onClick={() => setUserDropdown(!userDropdown)}>
                    <FiUser />
                  </button>
                )
              }

              {userDropdown && (
                <ul className='dropdown-menu show shadow' style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', minWidth: '200px', zIndex: 1060 }}>
                  {user ? (
                    <>
                      <li className='dropdown-item'>Hi, {user.firstName}</li>
                      {user.role === 'ROLE ADMIN' && (
                        <li><NavLink className='dropdown-item' to='/admin' onClick={() => setUserDropdown(false)}><i className='fa fa-tachometer-alt me-2'></i> Admin Dashboard</NavLink></li>
                      )}
                      {user.role === 'ROLE MERCHANT' && (
                        <li><NavLink className='dropdown-item' to='/merchant-dashboard' onClick={() => setUserDropdown(false)}><i className='fa fa-briefcase me-2'></i> Merchant Dashboard</NavLink></li>
                      )}
                      <li><button className='dropdown-item' onClick={handleLogout}><i className='fa fa-sign-out-alt me-2'></i> Logout</button></li>
                    </>
                  ) : (
                    <>
                      <li><NavLink className='dropdown-item' to='/login' onClick={() => setUserDropdown(false)}><i className='fa fa-sign-in-alt me-2'></i> Sign In</NavLink></li>
                      {/* <li><NavLink className='dropdown-item' to='/register' onClick={() => setUserDropdown(false)}><FiUser /> Sign Up</NavLink></li> */}
                    </>
                  )}
                </ul>
              )}
            </div>

            {/* CART ICON */}
            <div className='position-relative'>
              <button className='btn nav-icon' style={{ border: 'none', background: 'transparent', fontSize: '2rem', paddingTop: '0px' }} onClick={() => setCartSidebar(true)}>
                <RiShoppingCartLine />
                {cartItems.length > 0 && <span className='position-absolute translate-middle badge rounded-pill py-1' style={{ fontSize: '10px', top: '2px', left: '85%', backgroundColor: '#d4b86a' }}>{cartItems.length}</span>}
              </button>
            </div>
            {isMobile && (
              <button className='btn no-focus nav-icon' style={{ border: 'none', background: 'transparent', fontSize: '2rem' }} onClick={() => setCategoryDrawer(true)}>
                <RxHamburgerMenu />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* DESKTOP CATEGORIES BAR */}
      {!isMobile && (
        <div className='bg-dark text-white sticky-top' style={{ top: '72px', zIndex: 1020, height: '52px' }}>
          <div className='container py-1'>
            <ul className='d-flex list-unstyled gap-4 mb-0 justify-content-center flex-wrap p-0'>
              {categories.map((item, index) => (
                <NavLink style={{ textDecoration: "none", color: "white" }} key={index} to="/product" state={{ category: item.name }} className={() => location.pathname === '/product' && location.state?.category === item.name ? "active-links" : ""}>
                  <li className="cursor-pointer p-2 px-3 ">{item.name}</li>
                </NavLink>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* DARK OVERLAY (Only for Sidebars, NOT for Notification) */}
      {(cartSidebar || categoryDrawer) && (
        <div className='position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50' style={{ zIndex: 1040 }} onClick={handleOverlayClick} />
      )}

      {/* MOBILE DRAWERS (Unchanged) */}
      {isMobile && (
        <div className='position-fixed top-0 start-0 vh-100 bg-white shadow-lg' style={{ width: '280px', zIndex: 1050, transform: categoryDrawer ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease-in-out', overflowY: 'auto' }}>
          <div className='d-flex justify-content-between p-2 align-items-centerborder-bottom'>
            <button className='btn btn-sm text-dark w-fit ml-auto no-focus' onClick={() => setCategoryDrawer(false)}><i className='fa fa-times'></i></button>
          </div>
          <h5 className='px-4'>Categories</h5>
          <ul className='list-group list-group-flush'>
            {categories.map((item, index) => (
              <li key={index} className='list-group-item border-0 p-0'>
                <NavLink to={`/product`} state={{ category: item.name }} className='d-block text-decoration-none text-dark py-3 px-4' onClick={() => setCategoryDrawer(false)}>
                  <i className='fa fa-chevron-right me-2 text-muted'></i>{item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* MOBILE SEARCH (Unchanged) */}
      {isMobile && searchDrawer && (
        <div className='position-fixed top-0 start-0 w-100 vh-100 bg-white d-flex flex-column' style={{ zIndex: 1070, padding: '1rem' }}>
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <h5 className='mb-0'>Search Products</h5>
            <button className='btn no-focus' onClick={() => setSearchDrawer(false)} style={{ fontSize: '1.5rem' }}><i className='fa fa-times'></i></button>
          </div>
          <div className='input-group w-100 mb-3'>
            <input type='text' className='form-control ps-4 py-3' placeholder='Search for products...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
            <button className='btn btn-dark px-3 no-focus'>
              {isSearching ? <i className='fa fa-spinner fa-spin text-white'></i> : <i className='fa fa-search text-white'></i>}
            </button>
          </div>
          <div className="flex-grow-1 overflow-auto">
            {searchResults.length > 0 && (
              <ul className="list-group list-group-flush">
                {searchResults.map((prod) => (
                  <li key={prod._id || prod.id} className="list-group-item px-0 py-3 d-flex align-items-center" onClick={() => handleSuggestionClick(prod._id || prod.id)}>
                    <img src={prod.images && prod.images.length > 0 ? prod.images[0].imageUrl : "https://via.placeholder.com/50"} alt={prod.name} style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px', borderRadius: '4px' }} />
                    <div><div className="fw-bold text-dark">{prod.name}</div><div className="text-muted small">Rs {prod.price}</div></div>
                  </li>
                ))}
              </ul>
            )}
            {searchTerm && !isSearching && searchResults.length === 0 && <p className="text-center text-muted mt-3">No products found.</p>}
          </div>
        </div>
      )}

      {/* CART SIDEBAR (Unchanged) */}
      <div className='position-fixed top-0 end-0 vh-100 bg-white shadow-lg d-flex flex-column' style={{ width: isMobile ? '300px' : '380px', zIndex: 1050, transform: cartSidebar ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease-in-out' }}>
        <div className='d-flex justify-content-between align-items-center p-4 border-bottom'>
          <h5 className='mb-0 fw-bold' style={{ color: '#000' }}><i className="fa fa-shopping-bag me-2"></i>{cartItems.length} item(s)</h5>
          <button className='btn btn-sm text-muted no-focus' style={{ fontSize: '1.2rem' }} onClick={() => setCartSidebar(false)}><i className="fa fa-times"></i></button>
        </div>
        <div className='flex-grow-1 overflow-auto p-3'>
          {cartItems.length === 0 ? (
            <div className='text-center py-5 mt-5'>
              <RiShoppingCartLine style={{ fontSize: '3rem', color: '#eee' }} />
              <p className='text-muted mt-3'>Your cart is empty</p>
              <button className='btn btn-dark btn-sm mt-2' onClick={() => { setCartSidebar(false); navigate('/product') }}>Start Shopping</button>
            </div>
          ) : (
            <ul className='list-unstyled mb-0'>
              {cartItems.map((item, index) => (
                <li key={index} className='mb-4 d-flex align-items-start border-bottom pb-4'>
                  <div className="flex-shrink-0 border rounded p-1 bg-light" style={{ width: '80px', height: '80px' }}>
                    <img src={item.image || (item.images && item.images.length > 0 ? item.images[0].imageUrl : "https://via.placeholder.com/80?text=No+Image")} alt={item.name} className="w-100 h-100 object-fit-contain" />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <div className="d-flex justify-content-between">
                      <h6 className='fw-semibold mb-1 text-truncate' style={{ maxWidth: '160px' }}>{item.name || item.title}</h6>
                      <button className="btn btn-link text-muted p-0 text-decoration-none" onClick={() => dispatch(delCart(item))}><i className="fa fa-times"></i></button>
                    </div>
                    <div className="mb-2"><span className="fw-bold text-dark">Rs {item.price}</span></div>
                    <div className="d-flex align-items-center">
                      <div className="btn-group btn-group-sm border rounded" role="group">
                        <button className="btn btn-white text-dark py-0 border-end" onClick={() => dispatch(delCart(item))}>-</button>
                        <span className="px-3 d-flex align-items-center bg-white text-dark small fw-bold">{item.qty}</span>
                        <button className="btn btn-white text-dark py-0 border-start" onClick={() => dispatch(addCart({ ...item, qty: 1 }))}>+</button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {cartItems.length > 0 && (
          <div className='p-4 bg-white border-top shadow-sm'>
            <div className="d-flex justify-content-between mb-2"><span className="text-muted small">Excluding Shipping</span></div>
            <button className='btn btn-dark w-100 mb-2 py-2 fw-bold' onClick={() => { setCartSidebar(false); navigate('/checkout'); }}>Checkout Now (Rs {Math.round(subtotal)})</button>
            <button className='btn btn-outline-dark w-100 py-2 fw-bold' onClick={() => { setCartSidebar(false); navigate('/cart'); }}>View Cart</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;