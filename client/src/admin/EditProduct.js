import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Card,
  Image,
  Badge,
  Spinner
} from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProductById, updateProduct, fetchBrands } from '../api'; // Added fetchBrands import

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Brands State
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  // State for images - keeping track of existing and new
  const [existingImages, setExistingImages] = useState([]);
  const [existingThumbnails, setExistingThumbnails] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newThumbnails, setNewThumbnails] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState([]);

  // Track which existing images to delete
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [thumbnailsToDelete, setThumbnailsToDelete] = useState([]);

  // --- FETCH BRANDS ---
  useEffect(() => {
    const getBrands = async () => {
      try {
        const result = await fetchBrands();
        setBrands(result);
      } catch (error) {
        console.error('Failed to load brands');
      } finally {
        setLoadingBrands(false);
      }
    };
    getBrands();
  }, []);

  const formik = useFormik({
    initialValues: {
      sku: '',
      name: '',
      description: '',
      Disclaimer: '', // Added
      CleaningInstruction: '', // Added
      quantity: 0,
      price: 0,
      // --- NEW SIZE FIELDS ---
      height: '',
      width: '',
      depth: '',
      compartments: '',
      innerPocket: '',
      baseDetails: '',
      // ---------------------
      taxable: false,
      isActive: true,
      brand: '',
      slug: ''
    },
    validationSchema: Yup.object({
      sku: Yup.string().required('SKU is required'),
      name: Yup.string().required('Name is required'),
      description: Yup.string().required('Description is required'),
      Disclaimer: Yup.string().required('Disclaimer is required'),
      CleaningInstruction: Yup.string().required('Cleaning Instruction is required'),

      // Validation for new fields
      height: Yup.number().typeError('Must be number').required('Required'),
      width: Yup.number().typeError('Must be number').required('Required'),
      depth: Yup.number().typeError('Must be number').required('Required'),
      compartments: Yup.number().typeError('Must be number').required('Required'),
      innerPocket: Yup.number().typeError('Must be number').required('Required'),
      baseDetails: Yup.string().required('Base Details is required'),

      quantity: Yup.number().typeError('Quantity must be a number').required('Quantity is required'),
      price: Yup.number().typeError('Price must be a number').required('Price is required'),
      brand: Yup.string().required('Brand is required'),
      slug: Yup.string().required('Slug is required')
    }),
    onSubmit: async values => {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      try {
        // Calculate remaining images after deletion
        const remainingImages = existingImages.filter(
          img => !imagesToDelete.includes(img.imageKey)
        );
        const remainingThumbnails = existingThumbnails.filter(
          thumb => !thumbnailsToDelete.includes(thumb.imageKey)
        );

        // Validate total images after changes
        const totalThumbnails = remainingThumbnails.length + newThumbnails.length;

        if (totalThumbnails > 2) {
          setErrorMsg('Maximum 2 thumbnails allowed in total.');
          setLoading(false);
          return;
        }

        const formData = new FormData();

        // Add form fields
        Object.keys(values).forEach(key => {
          formData.append(key, values[key]);
        });

        // Add images to keep (existing ones not marked for deletion)
        formData.append('existingImages', JSON.stringify(remainingImages));
        formData.append('existingThumbnails', JSON.stringify(remainingThumbnails));

        // Add images to delete
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
        formData.append('thumbnailsToDelete', JSON.stringify(thumbnailsToDelete));

        // Add new main images
        newImages.forEach(file => {
          formData.append('image[]', file);
        });

        // Add new thumbnail images
        newThumbnails.forEach(file => {
          formData.append('thumbnail[]', file);
        });

        const response = await updateProduct(id, formData);
        setSuccessMsg(response.message || 'Product updated successfully');

        setTimeout(() => {
          navigate('/admin/products');
        }, 2000);
      } catch (error) {
        setErrorMsg(error.message || 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  });

  // Validate image dimensions helper
  const validateImageDimension = (file, requiredWidth, requiredHeight) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width === requiredWidth && img.height === requiredHeight) {
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

  // Handle main image file selection with validation (461x461)
  const handleImageChange = async e => {
    const files = Array.from(e.target.files);
    setErrorMsg('');

    // Check limit logic (Total 10)
    const remainingExisting = existingImages.filter(img => !imagesToDelete.includes(img.imageKey)).length;
    if (remainingExisting + newImages.length + files.length > 10) {
      setErrorMsg(`Total image limit is 10.`);
      e.target.value = '';
      return;
    }

    try {
      // Validate
      for (const file of files) {
        await validateImageDimension(file, 461, 461);
      }
      setNewImages(prev => [...prev, ...files]);
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreview(prev => [...prev, ...previews]);
    } catch (error) {
      setErrorMsg(`Error: Image must be 461x461px. File: ${error}`);
      e.target.value = '';
    }
  };

  // Handle thumbnail file selection with validation (279x419)
  const handleThumbnailChange = async e => {
    const files = Array.from(e.target.files);
    setErrorMsg('');

    // Check limit logic (Total 2)
    const remainingExisting = existingThumbnails.filter(thumb => !thumbnailsToDelete.includes(thumb.imageKey)).length;
    if (remainingExisting + newThumbnails.length + files.length > 2) {
      setErrorMsg(`Total thumbnail limit is 2.`);
      e.target.value = '';
      return;
    }

    try {
      // Validate
      for (const file of files) {
        await validateImageDimension(file, 279, 419);
      }
      setNewThumbnails(prev => [...prev, ...files]);
      const previews = files.map(file => URL.createObjectURL(file));
      setThumbnailPreview(prev => [...prev, ...previews]);
    } catch (error) {
      setErrorMsg(`Error: Thumbnail must be 279x419px. File: ${error}`);
      e.target.value = '';
    }
  };

  // Removal Helpers
  const removeExistingImage = imageKey => setImagesToDelete(prev => [...prev, imageKey]);
  const undoRemoveExistingImage = imageKey => setImagesToDelete(prev => prev.filter(key => key !== imageKey));

  const removeExistingThumbnail = imageKey => setThumbnailsToDelete(prev => [...prev, imageKey]);
  const undoRemoveExistingThumbnail = imageKey => setThumbnailsToDelete(prev => prev.filter(key => key !== imageKey));

  const removeNewImage = index => {
    const updatedImages = [...newImages];
    const updatedPreviews = [...imagePreview];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setNewImages(updatedImages);
    setImagePreview(updatedPreviews);
  };

  const removeNewThumbnail = index => {
    const updatedThumbnails = [...newThumbnails];
    const updatedPreviews = [...thumbnailPreview];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedThumbnails.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setNewThumbnails(updatedThumbnails);
    setThumbnailPreview(updatedPreviews);
  };

  // --- POPULATE DATA ON EDIT ---
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetchProductById(id);
        const product = response.product || response.data?.product || response;

        formik.setValues({
          sku: product.sku || '',
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          Disclaimer: product.Disclaimer || '',
          CleaningInstruction: product.CleaningInstruction || '',
          quantity: product.quantity || 0,
          price: product.price || 0,
          taxable: product.taxable || false,
          isActive: product.isActive !== undefined ? product.isActive : true,
          brand: product.brand?._id || product.brand || '',

          // --- Populate New Fields (Default to empty string if missing) ---
          height: product.height || '',
          width: product.width || '',
          depth: product.depth || '',
          compartments: product.compartments || '',
          innerPocket: product.innerPocket || '',
          baseDetails: product.baseDetails || '',
        });

        // Set existing images
        if (product.images && Array.isArray(product.images)) setExistingImages(product.images);
        if (product.thumbnails && Array.isArray(product.thumbnails)) setExistingThumbnails(product.thumbnails);

      } catch (error) {
        setErrorMsg('Failed to load product data.');
      }
    };

    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Calculations for display
  const getRemainingImagesCount = () => existingImages.filter(img => !imagesToDelete.includes(img.imageKey)).length;
  const getRemainingThumbnailsCount = () => existingThumbnails.filter(thumb => !thumbnailsToDelete.includes(thumb.imageKey)).length;
  const getTotalImagesCount = () => getRemainingImagesCount() + newImages.length;
  const getTotalThumbnailsCount = () => getRemainingThumbnailsCount() + newThumbnails.length;

  return (
    <Container className='my-5'>
      <Row className='mb-4 align-items-center'>
        <Col><h2>Edit Product</h2></Col>
        <Col className='text-end'>
          <Button variant='secondary' onClick={() => navigate('/admin/products')}>Back</Button>
        </Col>
      </Row>

      {successMsg && <Alert variant='success'>{successMsg}</Alert>}
      {errorMsg && <Alert variant='danger'>{errorMsg}</Alert>}

      <Card className='shadow-sm'>
        <Card.Body>
          <Form onSubmit={formik.handleSubmit}>

            {/* SKU */}
            <Form.Group as={Row} className='mb-3' controlId='sku'>
              <Form.Label column sm={2}>SKU</Form.Label>
              <Col sm={10}>
                <Form.Control type='text' name='sku' value={formik.values.sku} onChange={formik.handleChange} onBlur={formik.handleBlur} isInvalid={formik.touched.sku && formik.errors.sku} />
                <Form.Control.Feedback type='invalid'>{formik.errors.sku}</Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* Name */}
            <Form.Group as={Row} className='mb-3' controlId='name'>
              <Form.Label column sm={2}>Name</Form.Label>
              <Col sm={10}>
                <Form.Control type='text' name='name' value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} isInvalid={formik.touched.name && formik.errors.name} />
                <Form.Control.Feedback type='invalid'>{formik.errors.name}</Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* Slug */}
            <Form.Group as={Row} className='mb-3' controlId='slug'>
              <Form.Label column sm={2}>Slug</Form.Label>
              <Col sm={10}>
                <Form.Control type='text' name='slug' value={formik.values.slug} onChange={formik.handleChange} onBlur={formik.handleBlur} isInvalid={formik.touched.slug && formik.errors.slug} />
                <Form.Control.Feedback type='invalid'>{formik.errors.slug}</Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* Description */}
            <Form.Group as={Row} className='mb-3' controlId='description'>
              <Form.Label column sm={2}>Description</Form.Label>
              <Col sm={10}>
                <Form.Control as='textarea' rows={3} name='description' value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} isInvalid={formik.touched.description && formik.errors.description} />
                <Form.Control.Feedback type='invalid'>{formik.errors.description}</Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* Disclaimer */}
            <Form.Group as={Row} className='mb-3' controlId='Disclaimer'>
              <Form.Label column sm={2}>Disclaimer</Form.Label>
              <Col sm={10}>
                <Form.Control as='textarea' rows={2} name='Disclaimer' value={formik.values.Disclaimer} onChange={formik.handleChange} onBlur={formik.handleBlur} isInvalid={formik.touched.Disclaimer && formik.errors.Disclaimer} />
                <Form.Control.Feedback type='invalid'>{formik.errors.Disclaimer}</Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* Cleaning Instruction */}
            <Form.Group as={Row} className='mb-3' controlId='CleaningInstruction'>
              <Form.Label column sm={2}>Cleaning Instruction</Form.Label>
              <Col sm={10}>
                <Form.Control as='textarea' rows={2} name='CleaningInstruction' value={formik.values.CleaningInstruction} onChange={formik.handleChange} onBlur={formik.handleBlur} isInvalid={formik.touched.CleaningInstruction && formik.errors.CleaningInstruction} />
                <Form.Control.Feedback type='invalid'>{formik.errors.CleaningInstruction}</Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* Quantity & Price */}
            <Row className='mb-3'>
              <Form.Group as={Col} md={6} controlId='quantity'>
                <Form.Label>Quantity</Form.Label>
                <Form.Control type='number' name='quantity' value={formik.values.quantity} onChange={formik.handleChange} onBlur={formik.handleBlur} isInvalid={formik.touched.quantity && formik.errors.quantity} />
                <Form.Control.Feedback type='invalid'>{formik.errors.quantity}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6} controlId='price'>
                <Form.Label>Price</Form.Label>
                <Form.Control type='number' step='0.01' name='price' value={formik.values.price} onChange={formik.handleChange} onBlur={formik.handleBlur} isInvalid={formik.touched.price && formik.errors.price} />
                <Form.Control.Feedback type='invalid'>{formik.errors.price}</Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* --- NEW SIZE DETAILS SECTION --- */}
            <h6 className="mt-4 mb-3 border-bottom pb-2">Size Details</h6>

            <Row className='mb-3'>
              <Form.Group as={Col} md={6} controlId='height'>
                <Form.Label>Height</Form.Label>
                <Form.Control type='number' name='height' value={formik.values.height} onChange={formik.handleChange} isInvalid={formik.touched.height && formik.errors.height} />
                <Form.Control.Feedback type='invalid'>{formik.errors.height}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6} controlId='width'>
                <Form.Label>Width</Form.Label>
                <Form.Control type='number' name='width' value={formik.values.width} onChange={formik.handleChange} isInvalid={formik.touched.width && formik.errors.width} />
                <Form.Control.Feedback type='invalid'>{formik.errors.width}</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className='mb-3'>
              <Form.Group as={Col} md={6} controlId='depth'>
                <Form.Label>Depth</Form.Label>
                <Form.Control type='number' name='depth' value={formik.values.depth} onChange={formik.handleChange} isInvalid={formik.touched.depth && formik.errors.depth} />
                <Form.Control.Feedback type='invalid'>{formik.errors.depth}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6} controlId='compartments'>
                <Form.Label>Compartments</Form.Label>
                <Form.Control type='number' name='compartments' value={formik.values.compartments} onChange={formik.handleChange} isInvalid={formik.touched.compartments && formik.errors.compartments} />
                <Form.Control.Feedback type='invalid'>{formik.errors.compartments}</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className='mb-3'>
              <Form.Group as={Col} md={6} controlId='innerPocket'>
                <Form.Label>Inner Pocket</Form.Label>
                <Form.Control type='number' name='innerPocket' value={formik.values.innerPocket} onChange={formik.handleChange} isInvalid={formik.touched.innerPocket && formik.errors.innerPocket} />
                <Form.Control.Feedback type='invalid'>{formik.errors.innerPocket}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md={6} controlId='baseDetails'>
                <Form.Label>Base Details</Form.Label>
                <Form.Control type='text' name='baseDetails' placeholder='e.g. Soft Base Leather with 4 studs' value={formik.values.baseDetails} onChange={formik.handleChange} isInvalid={formik.touched.baseDetails && formik.errors.baseDetails} />
                <Form.Control.Feedback type='invalid'>{formik.errors.baseDetails}</Form.Control.Feedback>
              </Form.Group>
            </Row>

            {/* Brand */}
            <hr />
            <Form.Group as={Row} className='mb-3' controlId='brand'>
              <Form.Label column sm={2}>Brand</Form.Label>
              <Col sm={10}>
                {loadingBrands ? <Spinner animation='border' size='sm' /> : (
                  <Form.Select name='brand' value={formik.values.brand} onChange={formik.handleChange} onBlur={formik.handleBlur} isInvalid={formik.touched.brand && formik.errors.brand}>
                    <option value=''>Select Brand</option>
                    {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </Form.Select>
                )}
                <Form.Control.Feedback type='invalid'>{formik.errors.brand}</Form.Control.Feedback>
              </Col>
            </Form.Group>

            {/* --- THUMBNAILS SECTION --- */}
            <hr className='my-4' />
            <h5 className='mb-3'>Thumbnails <Badge bg='info'>{getTotalThumbnailsCount()} / 2 (279x419px)</Badge></h5>

            {/* Existing Thumbnails */}
            {existingThumbnails.length > 0 && (
              <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2}>Current Thumbnails</Form.Label>
                <Col sm={10}>
                  <div className='d-flex flex-wrap gap-2'>
                    {existingThumbnails.map((thumb, index) => {
                      const isMarked = thumbnailsToDelete.includes(thumb.imageKey);
                      return (
                        <div key={index} style={{ position: 'relative', opacity: isMarked ? 0.4 : 1 }}>
                          <Image src={thumb.imageUrl} thumbnail style={{ width: '80px', height: '120px', objectFit: 'cover', border: isMarked ? '3px solid red' : 'none' }} />
                          {isMarked ? (
                            <Button variant='success' size='sm' style={{ position: 'absolute', top: 5, right: 5, fontSize: 10 }} onClick={() => undoRemoveExistingThumbnail(thumb.imageKey)}>Undo</Button>
                          ) : (
                            <Button variant='danger' size='sm' style={{ position: 'absolute', top: 5, right: 5 }} onClick={() => removeExistingThumbnail(thumb.imageKey)}>×</Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Col>
              </Form.Group>
            )}

            {/* New Thumbnails */}
            <Form.Group as={Row} className='mb-3' controlId='thumbnails'>
              <Form.Label column sm={2}>Add Thumbnails</Form.Label>
              <Col sm={10}>
                <Form.Control type='file' multiple accept='image/*' onChange={handleThumbnailChange} />
                <Form.Text className='text-muted'>Add new thumbnails (279x419px). Max 2.</Form.Text>
                {thumbnailPreview.length > 0 && (
                  <div className='mt-3 d-flex flex-wrap gap-2'>
                    {thumbnailPreview.map((preview, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <Image src={preview} thumbnail style={{ width: '80px', height: '120px', objectFit: 'cover', border: '3px solid green' }} />
                        <Badge bg='success' style={{ position: 'absolute', top: 5, left: 5, fontSize: 9 }}>NEW</Badge>
                        <Button variant='danger' size='sm' style={{ position: 'absolute', top: 5, right: 5 }} onClick={() => removeNewThumbnail(index)}>×</Button>
                      </div>
                    ))}
                  </div>
                )}
              </Col>
            </Form.Group>

            {/* --- MAIN IMAGES SECTION --- */}
            <hr className='my-4' />
            <h5 className='mb-3'>Main Images <Badge bg='info'>{getTotalImagesCount()} / 10 (461x461px)</Badge></h5>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <Form.Group as={Row} className='mb-3'>
                <Form.Label column sm={2}>Current Images</Form.Label>
                <Col sm={10}>
                  <div className='d-flex flex-wrap gap-2'>
                    {existingImages.map((img, index) => {
                      const isMarked = imagesToDelete.includes(img.imageKey);
                      return (
                        <div key={index} style={{ position: 'relative', opacity: isMarked ? 0.4 : 1 }}>
                          <Image src={img.imageUrl} thumbnail style={{ width: '100px', height: '100px', objectFit: 'cover', border: isMarked ? '3px solid red' : 'none' }} />
                          {isMarked ? (
                            <Button variant='success' size='sm' style={{ position: 'absolute', top: 5, right: 5, fontSize: 10 }} onClick={() => undoRemoveExistingImage(img.imageKey)}>Undo</Button>
                          ) : (
                            <Button variant='danger' size='sm' style={{ position: 'absolute', top: 5, right: 5 }} onClick={() => removeExistingImage(img.imageKey)}>×</Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Col>
              </Form.Group>
            )}

            {/* New Images */}
            <Form.Group as={Row} className='mb-3' controlId='images'>
              <Form.Label column sm={2}>Add Images</Form.Label>
              <Col sm={10}>
                <Form.Control type='file' multiple accept='image/*' onChange={handleImageChange} />
                <Form.Text className='text-muted'>Add new images (461x461px). Total limit: 10.</Form.Text>
                {imagePreview.length > 0 && (
                  <div className='mt-3 d-flex flex-wrap gap-2'>
                    {imagePreview.map((preview, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <Image src={preview} thumbnail style={{ width: '100px', height: '100px', objectFit: 'cover', border: '3px solid green' }} />
                        <Badge bg='success' style={{ position: 'absolute', top: 5, left: 5, fontSize: 9 }}>NEW</Badge>
                        <Button variant='danger' size='sm' style={{ position: 'absolute', top: 5, right: 5 }} onClick={() => removeNewImage(index)}>×</Button>
                      </div>
                    ))}
                  </div>
                )}
              </Col>
            </Form.Group>

            {/* Checkboxes */}
            <hr className='my-4' />
            <Form.Group as={Row} className='mb-3'>
              <Col sm={{ span: 10, offset: 2 }}>
                <Form.Check type='checkbox' label='Taxable' name='taxable' checked={formik.values.taxable} onChange={formik.handleChange} className='mb-2' />
                <Form.Check type='checkbox' label='Active' name='isActive' checked={formik.values.isActive} onChange={formik.handleChange} />
              </Col>
            </Form.Group>

            {/* Submit */}
            <Row>
              <Col sm={{ span: 10, offset: 2 }}>
                <Button type='submit' variant='primary' disabled={loading}>
                  {loading ? 'Updating...' : 'Update Product'}
                </Button>
                <div className='mt-2'>
                  <small className='text-muted'>
                    {imagesToDelete.length > 0 && <div>Will delete {imagesToDelete.length} main image(s)</div>}
                    {thumbnailsToDelete.length > 0 && <div>Will delete {thumbnailsToDelete.length} thumbnail(s)</div>}
                    {newImages.length > 0 && <div>Will add {newImages.length} new main image(s)</div>}
                    {newThumbnails.length > 0 && <div>Will add {newThumbnails.length} new thumbnail(s)</div>}
                  </small>
                </div>
              </Col>
            </Row>

          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default EditProduct;