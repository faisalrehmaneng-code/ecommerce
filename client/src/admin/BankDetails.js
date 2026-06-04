import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Table,
  Badge
} from 'react-bootstrap';
import toast from 'react-hot-toast';
import { fetchBanks, addBank, updateBank, deleteBank } from '../api'; // Import APIs

const BankDetails = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form State
  const initialFormState = {
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    iban: '',
    isActive: true
  };
  const [formData, setFormData] = useState(initialFormState);

  // Bank Options
  const bankOptions = [
    'Bank Al Habib',
    'Meezan Bank',
    'HBL',
    'UBL',
    'Faysal Bank',
    'Allied Bank',
    'JazzCash',
    'EasyPaisa',
    'SadaPay',
    'Nayapay'
  ];

  // --- FETCH DATA ---
  const loadBanks = async () => {
    try {
      const data = await fetchBanks();
      setBanks(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load banks');
    }
  };

  useEffect(() => {
    loadBanks();
  }, []);

  // --- HANDLERS ---
  const handleChange = e => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // Submit (Add or Update)
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.bankName || !formData.accountNumber) {
      toast.error('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        // UPDATE Existing
        await updateBank(editId, formData);
        toast.success('Bank details updated!');
        setIsEditing(false);
        setEditId(null);
      } else {
        // ADD New
        await addBank(formData);
        toast.success('New bank added!');
      }

      setFormData(initialFormState); // Reset Form
      loadBanks(); // Refresh List
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Populate Form for Editing
  const handleEditClick = bank => {
    setFormData({
      bankName: bank.bankName,
      accountTitle: bank.accountTitle,
      accountNumber: bank.accountNumber,
      iban: bank.iban || '',
      isActive: bank.isActive
    });
    setEditId(bank._id);
    setIsEditing(true);
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData(initialFormState);
  };

  // Delete
  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      try {
        await deleteBank(id);
        toast.success('Bank account deleted');
        loadBanks();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className='admin-container'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h2 className='fw-bold mb-0'>Bank Details</h2>
      </div>

      <Row className='justify-content-center'>
        {/* --- LEFT: FORM (Add / Edit) --- */}

        <Col lg={4} className='mb-4 '>
          <Card className='border-0 shadow-md bg-light'>
            <Card.Header
              className={` border-bottom ${
                isEditing ? 'bg-warning bg-opacity-10' : 'text-white'
              }`}
              style={{
                backgroundColor: 'black',
                padding: '14px'
              }}
            >
              <h6 className='mb-0'>
                {isEditing ? 'Edit Bank Account' : 'Add New Bank'}
              </h6>
            </Card.Header>
            <Card.Body className='p-2 py-3'>
              <Form onSubmit={handleSubmit}>
                <Form.Group className='mb-3'>
                  <Form.Label className='small fw-bold'>Select Bank</Form.Label>
                  <Form.Select
                    name='bankName'
                    value={formData.bankName}
                    onChange={handleChange}
                  >
                    <option value=''>Choose Bank...</option>
                    {bankOptions.map((bank, i) => (
                      <option key={i} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label className='small fw-bold'>
                    Account Title
                  </Form.Label>
                  <Form.Control
                    type='text'
                    name='accountTitle'
                    placeholder='e.g. John Doe'
                    value={formData.accountTitle}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label className='small fw-bold'>
                    Account Number
                  </Form.Label>
                  <Form.Control
                    type='text'
                    name='accountNumber'
                    placeholder='e.g. 0123456789'
                    value={formData.accountNumber}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label className='small fw-bold'>
                    IBAN (Optional)
                  </Form.Label>
                  <Form.Control
                    type='text'
                    name='iban'
                    placeholder='PK...'
                    value={formData.iban}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Check
                    type='checkbox'
                    label='Active'
                    name='isActive'
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                </Form.Group>

                <div className='d-grid gap-2'>
                  <Button
                    type='submit'
                    className=' fw-bold'
                    style={{
                      backgroundColor: '#d4b86a',
                      border: '1px solid #d4b86a'
                    }}
                    disabled={loading}
                  >
                    {loading
                      ? 'Saving...'
                      : isEditing
                      ? 'Update Account'
                      : 'Add Account'}
                  </Button>

                  {isEditing && (
                    <Button
                      variant='outline-secondary'
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* --- RIGHT: LIST OF BANKS --- */}
        <Col lg={8}>
          <Card className='border-0 shadow-sm bg-light'>
            <Card.Header className=' py-3 border-bottom'>
              <h5 className='mb-0 fw-bold'>Active Bank Accounts</h5>
            </Card.Header>
            <div className='table-responsive'>
              <Table hover className='mb-0 align-middle bg-light'>
                <thead className='bg-light small text-muted text-uppercase'>
                  <tr>
                    <th className='ps-4'>Bank</th>
                    <th>Account Info</th>
                    <th>Status</th>
                    <th className='text-end pe-4'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banks.length > 0 ? (
                    banks.map(bank => (
                      <tr key={bank._id}>
                        <td className='ps-4'>
                          <span className='fw-bold text-dark'>
                            {bank.bankName}
                          </span>
                        </td>
                        <td>
                          <div className='d-flex flex-column'>
                            <span className='fw-bold text-dark'>
                              {bank.accountTitle}
                            </span>
                            <span className='text-muted small'>
                              {bank.accountNumber}
                            </span>
                            {bank.iban && (
                              <span
                                className='text-muted small'
                                style={{ fontSize: '0.75rem' }}
                              >
                                IBAN: {bank.iban}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {bank.isActive ? (
                            <Badge bg='success' className='fw-normal'>
                              Active
                            </Badge>
                          ) : (
                            <Badge bg='secondary' className='fw-normal'>
                              Hidden
                            </Badge>
                          )}
                        </td>
                        <td className='text-end pe-4'>
                          <Button
                            variant='light'
                            size='sm'
                            className='me-2 text-primary border'
                            onClick={() => handleEditClick(bank)}
                            title='Edit'
                          >
                            <i className='fa fa-pencil'></i>
                          </Button>
                          <Button
                            variant='light'
                            size='sm'
                            className='text-danger border'
                            onClick={() => handleDelete(bank._id)}
                            title='Delete'
                          >
                            <i className='fa fa-trash'></i>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan='4' className='text-center py-5 text-muted'>
                        No bank accounts added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BankDetails;
