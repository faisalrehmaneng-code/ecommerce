import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Image,
  Card,
  Spinner
} from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { addProduct, fetchBrands } from '../api';

function AddProduct() {
  const navigate = useNavigate();

  // Previews
  const [imagesPreview, setImagesPreview] = useState([]);
  const [thumbnailsPreview, setThumbnailsPreview] = useState([]);

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const getBrands = async () => {
      try {
        const result = await fetchBrands();
        setBrands(result);

        if (result && result.length > 0) {
          formik.setFieldValue('brand', result[0]._id);
        }
      } catch (error) {
        setErrorMsg('Failed to load brands');
      } finally {
        setLoadingBrands(false);
      }
    };
    getBrands();
  }, []);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      sku: '',
      name: '',
      description: '',
      Disclaimer: '',
      CleaningInstruction: '',
      quantity: '',
      height: '',
      width: '',
      depth: '',
      compartments: '',
      innerPocket: '',
      baseDetails: '',
      price: '',
      taxable: false,
      isActive: true,
      brand: '',
      thumbnails: [],
      images: []
    },
    validationSchema: Yup.object({
      sku: Yup.string().required('SKU is required'),
      name: Yup.string().required('Name is required'),
      description: Yup.string().required('Description is required'),
      Disclaimer: Yup.string().required('Disclaimer is required'),
      CleaningInstruction: Yup.string().required(
        'Cleaning Instruction is required'
      ),
      height: Yup.number().typeError('Must be number').required('Required'),
      width: Yup.number().typeError('Must be number').required('Required'),
      depth: Yup.number().typeError('Must be number').required('Required'),
      compartments: Yup.number()
        .typeError('Must be number')
        .required('Required'),
      innerPocket: Yup.number().typeError('Must be number').required('Required'),
      baseDetails: Yup.string().required('Base Details is required'),
      quantity: Yup.number().typeError('Must be number').required('Required'),
      price: Yup.number().typeError('Must be number').required('Required'),
      brand: Yup.string().required('Brand is required'),
      thumbnails: Yup.array()
        .min(1, 'Please upload at least one thumbnail')
        .max(2, 'You can only upload a maximum of 2 thumbnails')
        .required('Thumbnails are required'),
      images: Yup.mixed().required('Please upload at least one main image')
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      try {
        const formData = new FormData();
        Object.keys(values).forEach(key => {
          if (key !== 'images' && key !== 'thumbnails') {
            formData.append(key, values[key]);
          }
        });

        // Append Thumbnails
        values.thumbnails.forEach(file => formData.append('thumbnail[]', file));

        // Append Main Images
        values.images.forEach(file => formData.append('image[]', file));

        const response = await addProduct(formData);
        setSuccessMsg(response.message);
        resetForm();
        setImagesPreview([]);
        setThumbnailsPreview([]);
      } catch (error) {
        setErrorMsg(error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
  });

  // --- HELPER: Dimension Validation ---
  const validateImageDimension = (file, reqWidth, reqHeight) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width === reqWidth && img.height === reqHeight) {
          resolve(file);
        } else {
          reject(file.name);
        }
        URL.revokeObjectURL(objectUrl);
      };
      img.onerror = () => {
        reject(file.name);
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    });
  };

  // --- HANDLE THUMBNAIL CHANGE (Append Logic) ---
  const handleThumbnailChange = async e => {
    const newFiles = Array.from(e.target.files);
    setErrorMsg('');
    setSuccessMsg('');

    if (newFiles.length === 0) return;

    // Get current files from Formik
    const currentFiles = formik.values.thumbnails || [];

    // Check Limit (Max 2 total)
    if (currentFiles.length + newFiles.length > 2) {
      setErrorMsg(
        `Error: Maximum 2 thumbnails allowed. You already have ${currentFiles.length}.`
      );
      e.target.value = ''; // Reset input
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    await Promise.all(
      newFiles.map(async file => {
        try {
          await validateImageDimension(file, 279, 419);
          validFiles.push(file);
        } catch (fileName) {
          invalidFiles.push(fileName);
        }
      })
    );

    if (invalidFiles.length > 0) {
      setErrorMsg(
        `Error: Incorrect size (279x419): ${invalidFiles.join(', ')}`
      );
      e.target.value = '';
      return;
    }

    // APPEND new files to existing ones
    const updatedThumbnails = [...currentFiles, ...validFiles];
    formik.setFieldValue('thumbnails', updatedThumbnails);

    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setThumbnailsPreview([...thumbnailsPreview, ...newPreviewUrls]);

    // Reset input to allow adding more later
    e.target.value = '';
  };

  // --- REMOVE THUMBNAIL HELPER ---
  const removeThumbnail = index => {
    const updatedFiles = formik.values.thumbnails.filter((_, i) => i !== index);
    const updatedPreviews = thumbnailsPreview.filter((_, i) => i !== index);

    formik.setFieldValue('thumbnails', updatedFiles);
    setThumbnailsPreview(updatedPreviews);
  };

  // --- HANDLE MAIN IMAGE CHANGE (Append Logic) ---
  const handleImageChange = async e => {
    const newFiles = Array.from(e.target.files);
    setErrorMsg('');
    setSuccessMsg('');

    if (newFiles.length === 0) return;

    const currentFiles = formik.values.images || [];
    const validFiles = [];
    const invalidFiles = [];

    await Promise.all(
      newFiles.map(async file => {
        try {
          await validateImageDimension(file, 461, 461);
          validFiles.push(file);
        } catch (fileName) {
          invalidFiles.push(fileName);
        }
      })
    );

    if (invalidFiles.length > 0) {
      setErrorMsg(
        `Error: Incorrect size (461x461): ${invalidFiles.join(', ')}`
      );
      e.target.value = '';
      return;
    }

    // APPEND new files
    const updatedImages = [...currentFiles, ...validFiles];
    formik.setFieldValue('images', updatedImages);

    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setImagesPreview([...imagesPreview, ...newPreviewUrls]);

    e.target.value = '';
  };

  // --- REMOVE MAIN IMAGE HELPER ---
  const removeImage = index => {
    const updatedFiles = formik.values.images.filter((_, i) => i !== index);
    const updatedPreviews = imagesPreview.filter((_, i) => i !== index);

    formik.setFieldValue('images', updatedFiles);
    setImagesPreview(updatedPreviews);
  };

  return (
    <Container className='my-5'>
      <Row className='mb-4 align-items-center'>
        <Col>
          <h2>Add Product</h2>
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
          <Form onSubmit={formik.handleSubmit}>
            {/* SKU */}
            <Form.Group as={Row} className='mb-3' controlId='sku'>
              <Form.Label column sm={2}>
                SKU
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  type='text'
                  name='sku'
                  placeholder='Enter SKU'
                  value={formik.values.sku}
                  onChange={formik.handleChange}
                  isInvalid={formik.touched.sku && formik.errors.sku}
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.sku}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* Name */}
            <Form.Group as={Row} className='mb-3' controlId='name'>
              <Form.Label column sm={2}>
                Name
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  type='text'
                  name='name'
                  placeholder='Enter product name'
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  isInvalid={formik.touched.name && formik.errors.name}
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.name}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* Description */}
            <Form.Group as={Row} className='mb-3' controlId='description'>
              <Form.Label column sm={2}>
                Description
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  as='textarea'
                  rows={3}
                  name='description'
                  placeholder='Enter product description'
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  isInvalid={
                    formik.touched.description && formik.errors.description
                  }
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.description}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* Disclaimer */}
            <Form.Group as={Row} className='mb-3' controlId='Disclaimer'>
              <Form.Label column sm={2}>
                Disclaimer
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  as='textarea'
                  rows={2}
                  name='Disclaimer'
                  placeholder='Enter product disclaimer'
                  value={formik.values.Disclaimer}
                  onChange={formik.handleChange}
                  isInvalid={
                    formik.touched.Disclaimer && formik.errors.Disclaimer
                  }
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.Disclaimer}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* Cleaning Instruction */}
            <Form.Group
              as={Row}
              className='mb-3'
              controlId='CleaningInstruction'
            >
              <Form.Label column sm={2}>
                Cleaning Instruction
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  as='textarea'
                  rows={2}
                  name='CleaningInstruction'
                  placeholder='Enter product cleaning instruction'
                  value={formik.values.CleaningInstruction}
                  onChange={formik.handleChange}
                  isInvalid={
                    formik.touched.CleaningInstruction &&
                    formik.errors.CleaningInstruction
                  }
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.CleaningInstruction}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>
            {/* Quantity & Price */}
            <Row className='mb-3'>
              <Form.Group as={Col} md={6} controlId='quantity'>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type='number'
                  name='quantity'
                  placeholder='Enter quantity'
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  isInvalid={formik.touched.quantity && formik.errors.quantity}
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.quantity}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6} controlId='price'>
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type='number'
                  name='price'
                  placeholder='Enter price'
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  isInvalid={formik.touched.price && formik.errors.price}
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.price}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            {/* height, width, depth, compartments, innerPocket, baseDetails */}
            <Row className='mb-3'>
              <Form.Group as={Col} md={6} controlId='height'>
                <Form.Label>Height</Form.Label>
                <Form.Control
                  type='number'
                  name='height'
                  placeholder='Enter height'
                  value={formik.values.height}
                  onChange={formik.handleChange}
                  isInvalid={formik.touched.height && formik.errors.height}
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.height}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6} controlId='width'>
                <Form.Label>Width</Form.Label>
                <Form.Control
                  type='number'
                  name='width'
                  placeholder='Enter width'
                  value={formik.values.width}
                  onChange={formik.handleChange}
                  isInvalid={formik.touched.width && formik.errors.width}
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.width}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className='mb-3'>
              <Form.Group as={Col} md={6} controlId='depth'>
                <Form.Label>Depth</Form.Label>
                <Form.Control
                  type='number'
                  name='depth'
                  placeholder='Enter depth'
                  value={formik.values.depth}
                  onChange={formik.handleChange}
                  isInvalid={formik.touched.depth && formik.errors.depth}
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.depth}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6} controlId='compartments'>
                <Form.Label>Compartments</Form.Label>
                <Form.Control
                  type='number'
                  name='compartments'
                  placeholder='Enter compartments'
                  value={formik.values.compartments}
                  onChange={formik.handleChange}
                  isInvalid={formik.touched.compartments && formik.errors.compartments}
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.compartments}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Form.Group as={Row} className='mb-3' controlId='innerPocket'>
              <Form.Label column sm={2}>
                Inner Pocket
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  type='number'
                  name='innerPocket'
                  placeholder='Enter inner pocket'
                  value={formik.values.innerPocket}
                  onChange={formik.handleChange}
                  isInvalid={formik.touched.innerPocket && formik.errors.innerPocket}
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.innerPocket}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>
            <Form.Group as={Row} className='mb-3' controlId='baseDetails'>
              <Form.Label column sm={2}>
                Base Details
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  as='textarea'
                  rows={2}
                  name='baseDetails'
                  placeholder='Enter base details'
                  value={formik.values.baseDetails}
                  onChange={formik.handleChange}
                  isInvalid={formik.touched.baseDetails && formik.errors.baseDetails}
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.baseDetails}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* Brand Dropdown */}
            <Form.Group as={Row} className='mb-3' controlId='brand'>
              <Form.Label column sm={2}>
                Brand
              </Form.Label>
              <Col sm={10}>
                {loadingBrands ? (
                  <Spinner animation='border' size='sm' />
                ) : (
                  <Form.Select
                    name='brand'
                    value={formik.values.brand}
                    onChange={formik.handleChange}
                    isInvalid={formik.touched.brand && formik.errors.brand}
                  >
                    <option value=''>Select Brand</option>
                    {brands.map(b => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </Form.Select>
                )}
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.brand}
                </Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* Checkboxes */}
            <Form.Group as={Row} className='mb-3'>
              <Col sm={{ span: 10, offset: 2 }}>
                <Form.Check
                  type='checkbox'
                  label='Taxable'
                  name='taxable'
                  checked={formik.values.taxable}
                  onChange={formik.handleChange}
                  className='mb-2'
                />
                <Form.Check
                  type='checkbox'
                  label='Active'
                  name='isActive'
                  checked={formik.values.isActive}
                  onChange={formik.handleChange}
                />
              </Col>
            </Form.Group>

            {/* --- THUMBNAILS (Append Mode + Remove) --- */}
            <Form.Group as={Row} className='mb-4' controlId='thumbnails'>
              <Form.Label column sm={2}>
                Thumbnails <br />
                <small className='text-danger'>(279 x 419, Max 2)</small>
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleThumbnailChange}
                  isInvalid={
                    formik.touched.thumbnails && formik.errors.thumbnails
                  }
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.thumbnails}
                </Form.Control.Feedback>
                <div className='mt-3 d-flex flex-wrap gap-2'>
                  {thumbnailsPreview.map((img, idx) => (
                    <div key={idx} className='position-relative'>
                      <Image
                        src={img}
                        thumbnail
                        width={80}
                        height={80}
                        alt={`thumb-${idx}`}
                      />
                      <button
                        type='button'
                        className='btn btn-danger btn-sm position-absolute top-0 end-0 p-0 rounded-circle d-flex align-items-center justify-content-center'
                        style={{
                          width: '20px',
                          height: '20px',
                          transform: 'translate(30%, -30%)'
                        }}
                        onClick={() => removeThumbnail(idx)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </Col>
            </Form.Group>

            {/* --- MAIN IMAGES (Append Mode + Remove) --- */}
            <Form.Group as={Row} className='mb-4' controlId='images'>
              <Form.Label column sm={2}>
                Main Images <br />
                <small className='text-danger'>(461 x 461)</small>
              </Form.Label>
              <Col sm={10}>
                <Form.Control
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleImageChange}
                  isInvalid={formik.touched.images && formik.errors.images}
                />
                <Form.Control.Feedback type='invalid'>
                  {formik.errors.images}
                </Form.Control.Feedback>
                <div className='mt-3 d-flex flex-wrap gap-2'>
                  {imagesPreview.map((img, idx) => (
                    <div key={idx} className='position-relative'>
                      <Image
                        src={img}
                        thumbnail
                        width={100}
                        height={100}
                        alt={`preview-${idx}`}
                      />
                      <button
                        type='button'
                        className='btn btn-danger btn-sm position-absolute top-0 end-0 p-0 rounded-circle d-flex align-items-center justify-content-center'
                        style={{
                          width: '24px',
                          height: '24px',
                          transform: 'translate(30%, -30%)'
                        }}
                        onClick={() => removeImage(idx)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </Col>
            </Form.Group>

            <Row>
              <Col sm={{ span: 10, offset: 2 }}>
                <Button type='submit' variant='primary' disabled={loading}>
                  {loading ? 'Submitting...' : 'Add Product'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AddProduct;
