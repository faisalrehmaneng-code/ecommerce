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
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProducts, getCategoryById, updateCategory } from '../api';

const EditCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // IMAGE STATES
  const [currentImage, setCurrentImage] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Fetch Products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await fetchProducts();
        setProductList(
          res?.products || res?.data?.products || res?.data || res || []
        );
      } catch (err) {
        toast.error('Failed to load products');
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  // Fetch Category
  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoadingCategory(true);
        const res = await getCategoryById(id);
        if (res) {
          setName(res.name || '');
          setDescription(res.description || '');
          setSlug(res.slug || '');
          setIsActive(res.isActive ?? true);
          setSelectedProducts(res.products?.map(p => p._id || p) || []);
          setCurrentImage(res?.images?.[0]?.imageUrl || null);
        } else {
          toast.error('Category not found');
        }
      } catch (err) {
        toast.error('Failed to fetch category');
        console.error(err);
      } finally {
        setLoadingCategory(false);
      }
    };
    if (id) loadCategory();
  }, [id]);

  // Generate slug
  const generateSlug = text =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  const handleNameChange = e => {
    const newName = e.target.value;
    setName(newName);
    if (!slug || slug === generateSlug(name)) setSlug(generateSlug(newName));
  };

  // Checkbox handlers
  const handleCheckboxSelect = prodId => {
    setSelectedProducts(prev =>
      prev.includes(prodId) ? prev.filter(p => p !== prodId) : [...prev, prodId]
    );
  };
  const removeProduct = prodId =>
    setSelectedProducts(prev => prev.filter(p => p !== prodId));

  // Image handlers
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      if (currentImage) setImagesToDelete([currentImage]); // mark current image for deletion
      setNewImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Submit
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) return setErrorMsg('Category name is required.');
    if (!slug.trim()) return setErrorMsg('Category slug is required.');

    try {
      const formData = new FormData();
      formData.append('category[name]', name);
      formData.append('category[description]', description);
      formData.append('category[slug]', slug);
      formData.append('category[isActive]', isActive);
      formData.append('category[products]', JSON.stringify(selectedProducts));
      formData.append(
        'category[existingImages]',
        JSON.stringify(currentImage ? [{ imageUrl: currentImage }] : [])
      );
      formData.append(
        'category[imagesToDelete]',
        JSON.stringify(imagesToDelete)
      );

      if (newImageFile) formData.append('category[image]', newImageFile);

      const res = await updateCategory(id, formData);
      toast.success(res.message || 'Category updated successfully');
      setSuccessMsg(res.message);
      setTimeout(() => navigate('/admin/categories'), 1500);
    } catch (err) {
      console.error(err);
      const msg = err?.message || 'Failed to update category';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategory)
    return (
      <Container className='my-5 text-center'>
        <Spinner animation='border' /> Loading category...
      </Container>
    );

  return (
    <Container className='my-5'>
      <Row className='mb-4 align-items-center'>
        <Col>
          <h2>Edit Category</h2>
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
                Name <span className='text-danger'>*</span>
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  type='text'
                  placeholder='Enter category name'
                  value={name}
                  onChange={handleNameChange}
                  required
                />
              </Col>
            </Form.Group>

            {/* Slug */}
            <Form.Group as={Row} className='mb-3'>
              <Form.Label column sm={2}>
                Slug <span className='text-danger'>*</span>
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  type='text'
                  placeholder='category-slug'
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  required
                />
                <Form.Text className='text-muted'>
                  URL-friendly version of the name (auto-generated from name)
                </Form.Text>
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

            {/* Image Upload */}
            <Form.Group as={Row} className='mb-4'>
              <Form.Label column sm={2}>
                Category Image
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  type='file'
                  accept='image/*'
                  onChange={handleImageChange}
                />
                <Form.Text className='text-muted'>
                  Upload an image for the category
                </Form.Text>
                <div className='mt-3'>
                  {previewImage ? (
                    <Image src={previewImage} rounded thumbnail width={150} />
                  ) : currentImage ? (
                    <Image src={currentImage} rounded thumbnail width={150} />
                  ) : (
                    <p className='text-muted'>No image selected</p>
                  )}
                </div>
              </Col>
            </Form.Group>

            {/* Products Checkbox Multi-Select */}
            <Form.Group as={Row} className='mb-4'>
              <Form.Label column sm={2}>
                Products
              </Form.Label>
              <Col sm={10}>
                {loadingProducts ? (
                  <div className='d-flex align-items-center'>
                    <Spinner animation='border' size='sm' className='me-2' />{' '}
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

            {/* Selected Products Badges */}
            {selectedProducts.length > 0 && (
              <Row className='mb-4'>
                <Col sm={{ span: 10, offset: 2 }}>
                  <div className='d-flex flex-wrap gap-2'>
                    {selectedProducts.map(prodId => {
                      const prod = productList.find(p => p._id === prodId) || {
                        name: 'Unknown Product'
                      };
                      return (
                        <Badge
                          key={prodId}
                          bg='primary'
                          pill
                          className='p-2 d-flex align-items-center'
                        >
                          {prod.name}
                          <Button
                            size='sm'
                            variant='light'
                            className='ms-2 py-0 px-2'
                            onClick={() => removeProduct(prodId)}
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

            {/* Submit */}
            <Row>
              <Col sm={{ span: 10, offset: 2 }}>
                <Button type='submit' disabled={loading} variant='primary'>
                  {loading ? (
                    <>
                      <Spinner
                        as='span'
                        animation='border'
                        size='sm'
                        className='me-2'
                      />{' '}
                      Updating...
                    </>
                  ) : (
                    'Update Category'
                  )}
                </Button>
                <Button
                  variant='outline-secondary'
                  className='ms-2'
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditCategory;
