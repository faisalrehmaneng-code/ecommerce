import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Container,
  Row,
  Col,
  Image,
  Alert,
  Spinner
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { deleteProduct, fetchProducts } from '../api';
import toast, { Toaster } from 'react-hot-toast';

function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch all products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchProducts();
        // Ensure res.products is an array
        setProducts(res.products || []);
      } catch (error) {
        setErrorMsg('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle Delete
  const handleDelete = async productId => {
    if (!window.confirm('Are you sure you want to delete this product?'))
      return;

    try {
      await deleteProduct(productId);

      setProducts(prev => prev.filter(p => p._id !== productId));
      toast.success('Product deleted successfully!');
    } catch (error) {
      toast.success('Failed to delete product.');
    }
  };

  return (
    <>
      <Toaster position='top-center' reverseOrder={false} />
      <Container className='my-5'>
        <Row className='mb-4 align-items-center'>
          <Col>
            <h2>Product List</h2>
          </Col>
          <Col className='text-end'>
            <Button
              variant='secondary'
              onClick={() => navigate('/admin/add-product')}
            >
              Add Product
            </Button>
          </Col>
        </Row>

        {errorMsg && <Alert variant='danger'>{errorMsg}</Alert>}

        {loading ? (
          <div className='d-flex justify-content-center'>
            <Spinner animation='border' variant='primary' />
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>SKU</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Taxable</th>
                <th>Active</th>
                <th>Images</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan='10' className='text-center'>
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={product._id}>
                    <td>{index + 1}</td>
                    <td>{product.sku}</td>
                    <td>{product.name}</td>
                    <td>{product.brand?.name || 'N/A'}</td>
                    <td>{product.quantity}</td>
                    <td>${product.price}</td>
                    <td>{product.taxable ? 'Yes' : 'No'}</td>
                    <td>{product.isActive ? 'Yes' : 'No'}</td>
                    <td>
                      <div className='d-flex flex-wrap gap-2'>
                        {product.images?.map((img, idx) => (
                          <Image
                            key={idx}
                            src={img.imageUrl || img.url} // adjust based on backend
                            thumbnail
                            width={50}
                            height={50}
                            alt='product'
                          />
                        ))}
                      </div>
                    </td>
                    <td>
                      <Button
                        size='sm'
                        variant='warning'
                        className='me-2'
                        onClick={() =>
                          navigate(`/admin/product/${product._id}`)
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        size='sm'
                        variant='danger'
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Container>
    </>
  );
}

export default ProductList;
