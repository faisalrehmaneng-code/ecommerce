import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Card,
  Spinner,
  Badge,
  Image
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProducts, addCategory } from '../api';

const AddCategory = () => {
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Image States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // -----------------------------------------
  // Fetch Products on Mount
  // -----------------------------------------
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await fetchProducts();

        if (Array.isArray(res)) {
          setProductList(res);
        } else if (Array.isArray(res?.products)) {
          setProductList(res.products);
        } else if (Array.isArray(res?.data?.products)) {
          setProductList(res.data.products);
        } else if (Array.isArray(res?.data)) {
          setProductList(res.data);
        } else {
          toast.error('Unexpected product data format');
        }
      } catch (err) {
        toast.error('Failed to load products');
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // -----------------------------------------
  // Handle Image Selection (150x150 Validation)
  // -----------------------------------------
  const handleImageChange = e => {
    const file = e.target.files[0];
    setErrorMsg('');

    if (file) {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        // Validate Dimensions: 150x150
        if (img.width === 150 && img.height === 150) {
          setImageFile(file);
          setImagePreview(objectUrl);
        } else {
          setErrorMsg(
            `Error: Image must be exactly 150x150 pixels. Uploaded: ${img.width}x${img.height}`
          );
          setImageFile(null);
          setImagePreview('');
          e.target.value = null; // Reset input
        }
      };

      img.onerror = () => {
        setErrorMsg('Invalid image file.');
      };

      img.src = objectUrl;
    }
  };

  // -----------------------------------------
  // Checkbox Select Handler
  // -----------------------------------------
  const handleCheckboxSelect = id => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const removeProduct = id => {
    setSelectedProducts(prev => prev.filter(p => p !== id));
  };

  // -----------------------------------------
  // Submit Form
  // -----------------------------------------
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      setLoading(false);
      return;
    }

    try {
      // Use FormData to handle File Upload
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('isActive', isActive);

      // Append products array (might need JSON.stringify depending on backend, but usually loop works)
      selectedProducts.forEach(prodId => formData.append('products[]', prodId));

      if (imageFile) {
        formData.append('image', imageFile); // 'image' key depends on your backend multer setup
      }

      const result = await addCategory(formData);

      toast.success(result.message || 'Category Added Successfully!');
      setSuccessMsg(result.message);

      // Reset form
      setName('');
      setDescription('');
      setIsActive(true);
      setSelectedProducts([]);
      setImageFile(null);
      setImagePreview('');
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.error || 'Failed to add category!';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className='my-5'>
      <Row className='mb-4 align-items-center'>
        <Col>
          <h2>Add Category</h2>
        </Col>
        <Col className='text-end'>
          <Button variant='secondary' onClick={() => navigate(-1)}>
            Back
          </Button>
        </Col>
      </Row>

      {successMsg && <Alert variant='success'>{successMsg}</Alert>}
      {errorMsg && <Alert variant='danger'>{errorMsg}</Alert>}

      <Card className='shadow-sm'>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* Name */}
            <Form.Group as={Row} className='mb-3'>
              <Form.Label column sm={2}>
                Name
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  type='text'
                  placeholder='Enter category name'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </Col>
            </Form.Group>

            {/* Description */}
            <Form.Group as={Row} className='mb-3'>
              <Form.Label column sm={2}>
                Description
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  as='textarea'
                  rows={3}
                  placeholder='Enter description'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </Col>
            </Form.Group>

            {/* Category Image (New Field) */}
            <Form.Group as={Row} className='mb-3'>
              <Form.Label column sm={2}>
                Image <br />
                <small className='text-danger'>(150x150)</small>
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className='mt-2'>
                    <Image
                      src={imagePreview}
                      thumbnail
                      width={100}
                      height={100}
                      alt='Preview'
                    />
                  </div>
                )}
              </Col>
            </Form.Group>

            {/* Active Toggle */}
            <Form.Group as={Row} className='mb-3'>
              <Col sm={{ span: 10, offset: 2 }}>
                <Form.Check
                  type='checkbox'
                  label='Active'
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                />
              </Col>
            </Form.Group>

            {/* Multi Select (Checkbox List) */}
            <Form.Group as={Row} className='mb-4'>
              <Form.Label column sm={2}>
                Products
              </Form.Label>
              <Col sm={10}>
                {loadingProducts ? (
                  <div className='d-flex align-items-center'>
                    <Spinner animation='border' size='sm' className='me-2' />
                    Loading products...
                  </div>
                ) : (
                  <div
                    style={{
                      maxHeight: '250px',
                      overflowY: 'auto',
                      border: '1px solid #ccc',
                      padding: '10px',
                      borderRadius: '5px'
                    }}
                  >
                    {productList.length === 0 && (
                      <p className='text-muted'>No products available</p>
                    )}

                    {productList.map(prod => (
                      <Form.Check
                        key={prod._id}
                        type='checkbox'
                        label={prod.name}
                        value={prod._id}
                        checked={selectedProducts.includes(prod._id)}
                        onChange={() => handleCheckboxSelect(prod._id)}
                        className='mb-1'
                      />
                    ))}
                  </div>
                )}
              </Col>
            </Form.Group>

            {/* Selected Products Chips */}
            {selectedProducts.length > 0 && (
              <Row className='mb-4'>
                <Col sm={{ span: 10, offset: 2 }}>
                  <div className='d-flex flex-wrap gap-2'>
                    {selectedProducts.map(id => {
                      const prod = productList.find(p => p._id === id) || {
                        name: 'Unknown'
                      };
                      return (
                        <Badge
                          key={id}
                          bg='primary'
                          pill
                          className='p-2 d-flex align-items-center'
                        >
                          {prod.name}
                          <Button
                            size='sm'
                            variant='light'
                            className='ms-2 py-0 px-2'
                            onClick={() => removeProduct(id)}
                          >
                            ×
                          </Button>
                        </Badge>
                      );
                    })}
                  </div>
                </Col>
              </Row>
            )}

            {/* Submit Button */}
            <Row>
              <Col sm={{ span: 10, offset: 2 }}>
                <Button type='submit' disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner
                        as='span'
                        animation='border'
                        size='sm'
                        className='me-2'
                      />
                      Adding...
                    </>
                  ) : (
                    'Add Category'
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddCategory;
