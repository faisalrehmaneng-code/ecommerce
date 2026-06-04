import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchProducts,
  fetchCategories,
  fetchAllUsers,
  fetchAllReviews
} from '../api';
import Skeleton from 'react-loading-skeleton';

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    users: 0,
    reviews: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current date for the header
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [productsData, categoriesData, usersData, reviewsData] =
          await Promise.all([
            fetchProducts(),
            fetchCategories(),
            fetchAllUsers(1),
            fetchAllReviews(1)
          ]);

        const productList = productsData.products || productsData || [];
        const productCount = productList.length;
        const categoryCount = (categoriesData || []).length;
        const userCount = usersData.count || (usersData.users || []).length;
        const reviewCount =
          reviewsData.count || (reviewsData.reviews || []).length;

        setStats({
          products: productCount,
          categories: categoryCount,
          users: userCount,
          reviews: reviewCount
        });

        // Get the last 5 products for the "Recent Activity" table
        // Assuming the API returns them sorted, or we take the first 5
        setRecentProducts(productList.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // --- Modern Stat Card Component ---
  const StatCard = ({ title, count, icon, link, color, bgClass }) => (
    <div className='col-md-3 mb-4'>
      <div
        className='card border-0 shadow-sm h-100 position-relative overflow-hidden'
        style={{ borderRadius: '12px' }}
      >
        <div className='card-body p-4'>
          <div className='d-flex justify-content-between align-items-start'>
            <div>
              <p
                className='text-muted text-uppercase fw-bold mb-1'
                style={{ fontSize: '0.75rem', letterSpacing: '1px' }}
              >
                {title}
              </p>
              <h2 className='display-5 fw-bold text-dark mb-0'>{count}</h2>
            </div>
            <div
              className={`d-flex align-items-center justify-content-center rounded-3 ${bgClass}`}
              style={{ width: '45px', height: '45px', color: color }}
            >
              <i className={`fa ${icon} fs-5`}></i>
            </div>
          </div>
          <div className='mt-4'>
            <Link
              to={link}
              className='text-decoration-none small fw-bold text-muted stretched-link'
            >
              View all {title.toLowerCase()}{' '}
              <i
                className='fa fa-chevron-right ms-1'
                style={{ fontSize: '0.7rem' }}
              ></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='container-fluid px-0'>
      {/* --- HEADER SECTION --- */}
      <div className='row mb-5 align-items-end'>
        <div className='col-md-8'>
          <h2 className=' fw-bold display-6 text-dark'>Dashboard</h2>
          {/* <h2 className="fw-bold display-6 text-dark">Overview</h2> */}
        </div>
        <div className='col-md-4 text-md-end'>
          <div className='bg-white px-3 py-2 rounded-pill shadow-sm d-inline-block border'>
            <i className='fa fa-calendar-o me-2 text-muted'></i>
            <span className='fw-bold text-dark small'>{currentDate}</span>
          </div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className='row mb-5'>
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div className='col-md-3 mb-4' key={i}>
              <Skeleton height={140} borderRadius={12} />
            </div>
          ))
        ) : (
          <>
            <StatCard
              title='Products'
              count={stats.products}
              icon='fa-shopping-bag'
              link='/admin/products'
              color='#000'
              bgClass='bg-dark text-white'
            />
            <StatCard
              title='Categories'
              count={stats.categories}
              icon='fa-tags'
              link='/admin/categories'
              color='#d4b86a' // Gold
              bgClass='bg-warning bg-opacity-10'
            />
            <StatCard
              title='Customers'
              count={stats.users}
              icon='fa-users'
              link='/admin/user'
              color='#0033a0' // Blue
              bgClass='bg-primary bg-opacity-10'
            />
            <StatCard
              title='Reviews'
              count={stats.reviews}
              icon='fa-star'
              link='/admin/reviews'
              color='#dc3545' // Red
              bgClass='bg-danger bg-opacity-10'
            />
          </>
        )}
      </div>

      {/* --- RECENT ACTIVITY & QUICK ACTIONS --- */}
      <div className='row'>
        {/* Left: Recently Added Products */}
        <div className='col-lg-8 mb-4'>
          <div
            className='card border-0 shadow-sm'
            style={{ borderRadius: '12px' }}
          >
            <div className='card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center'>
              <h5 className='fw-bold mb-0'>Recently Added Products</h5>
              <Link
                to='/admin/products'
                className='btn btn-sm btn-outline-dark rounded-pill px-3'
              >
                View All
              </Link>
            </div>
            <div className='card-body p-4'>
              {loading ? (
                <Skeleton count={5} height={30} className='mb-2' />
              ) : (
                <div className='table-responsive'>
                  <table className='table table-borderless align-middle mb-0'>
                    <thead className='text-muted small text-uppercase'>
                      <tr className='border-bottom'>
                        <th className='pb-3 fw-normal'>Product</th>
                        <th className='pb-3 fw-normal'>Price</th>
                        <th className='pb-3 fw-normal text-end'>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProducts.length > 0 ? (
                        recentProducts.map(prod => (
                          <tr key={prod._id} className='border-bottom'>
                            <td className='py-3'>
                              <div className='d-flex align-items-center'>
                                <div
                                  className='rounded bg-light d-flex align-items-center justify-content-center'
                                  style={{ width: '40px', height: '40px' }}
                                >
                                  <img
                                    src={
                                      prod.images && prod.images.length > 0
                                        ? prod.images[0].imageUrl
                                        : 'https://via.placeholder.com/40'
                                    }
                                    alt=''
                                    style={{
                                      width: '30px',
                                      height: '30px',
                                      objectFit: 'contain'
                                    }}
                                  />
                                </div>
                                <div className='ms-3'>
                                  <span className='d-block fw-bold text-dark'>
                                    {prod.name}
                                  </span>
                                  <small className='text-muted'>
                                    {prod.category?.name || 'General'}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td className='py-3 fw-bold'>Rs {prod.price}</td>
                            <td className='py-3 text-end'>
                              {prod.quantity > 0 ? (
                                <span className='badge bg-success bg-opacity-10 text-success rounded-pill px-3'>
                                  In Stock
                                </span>
                              ) : (
                                <span className='badge bg-danger bg-opacity-10 text-danger rounded-pill px-3'>
                                  Out of Stock
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan='3'
                            className='text-center py-4 text-muted'
                          >
                            No products found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className='col-lg-4'>
          <div
            className='card border-0 shadow-sm mb-4'
            style={{ borderRadius: '12px' }}
          >
            <div className='card-header bg-white border-0 pt-4 px-4 pb-0'>
              <h5 className='fw-bold mb-0'>Quick Actions</h5>
            </div>
            <div className='card-body p-4'>
              <div className='d-grid gap-3'>
                <Link
                  to='/admin/add-product'
                  className='btn btn-dark py-3 text-start px-4 rounded-3 d-flex align-items-center justify-content-between'
                >
                  <span>
                    <i className='fa fa-plus-circle me-2'></i> Add New Product
                  </span>
                  <i className='fa fa-chevron-right small opacity-50'></i>
                </Link>
                <Link
                  to='/admin/add-category'
                  className='btn btn-light border py-3 text-start px-4 rounded-3 d-flex align-items-center justify-content-between'
                >
                  <span>
                    <i className='fa fa-list-alt me-2'></i> Add New Category
                  </span>
                  <i className='fa fa-chevron-right small text-muted'></i>
                </Link>
                <Link
                  to='/admin/reviews'
                  className='btn btn-light border py-3 text-start px-4 rounded-3 d-flex align-items-center justify-content-between'
                >
                  <span>
                    <i className='fa fa-star me-2'></i> Approve Reviews
                  </span>
                  <i className='fa fa-chevron-right small text-muted'></i>
                </Link>
              </div>
            </div>
          </div>

          {/* Mini Info Card */}
          <div
            className='card border-0 shadow-sm text-white'
            style={{ borderRadius: '12px', backgroundColor: '#d4b86a' }}
          >
            <div className='card-body p-4 text-center'>
              <i className='fa fa-rocket fa-2x mb-3 text-white-50'></i>
              <h5 className='fw-bold'>Boost Sales?</h5>
              <p className='small opacity-75 mb-3'>
                Ensure your inventory is up to date and respond to customer
                reviews.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
