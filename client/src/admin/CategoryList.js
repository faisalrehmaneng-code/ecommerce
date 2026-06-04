import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Spinner,
  Alert,
  Form
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { deleteCategory, fetchCategories } from '../api';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      console.log(data);
      setCategories(data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this category?'))
      return;

    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c._id !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  const filteredCategories = categories.filter(c => {
    const nameMatch = c.name.toLowerCase().includes(search.toLowerCase());
    const descMatch = c.description
      ?.toLowerCase()
      .includes(search.toLowerCase());

    return nameMatch || descMatch;
  });

  return (
    <Container className='my-5'>
      <Row className='mb-4 align-items-center'>
        <Col>
          <h2 className='fw-bold'>Categories</h2>
        </Col>
        <Col className='text-end'>
          <Button
            variant='secondary'
            onClick={() => navigate('/admin/add-category')}
          >
            Add Category
          </Button>
        </Col>
      </Row>

      {/* Search */}
      <Row className='mb-3'>
        <Col md={4}>
          <Form.Control
            type='text'
            placeholder='Search categories...'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>
      </Row>

      {/* Card Wrapper */}
      <Card className='shadow-sm'>
        <Card.Body>
          {loading ? (
            <div className='text-center my-5'>
              <Spinner animation='border' />
            </div>
          ) : filteredCategories.length === 0 ? (
            <Alert variant='info' className='text-center'>
              No categories found.
            </Alert>
          ) : (
            <Table
              responsive
              bordered
              hover
              className='align-middle text-center'
            >
              <thead className='table-dark'>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Active</th>
                  <th>Products Count</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map(c => (
                  <tr key={c._id}>
                    <td>{c.name}</td>

                    <td>{c.description}</td>

                    <td>{c.isActive ? 'Yes' : 'No'}</td>

                    <td>{c.products?.length || 0}</td>

                    <td>{new Date(c.created).toLocaleDateString()}</td>

                    <td>
                      <Button
                        size='sm'
                        variant='info'
                        className='me-2'
                        onClick={() => navigate(`/admin/category/${c._id}`)}
                      >
                        Edit
                      </Button>

                      <Button
                        size='sm'
                        variant='danger'
                        onClick={() => handleDelete(c._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CategoryList;
