'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { customerService } from '@/Services';
import { useCustomerStore } from '@/State';
import type { Customer, CreateCustomerDto } from '@/Interfaces';
import { formatDate } from '@/Helpers';

export const CustomerManagement: React.FC = () => {
  const customerStore = useCustomerStore();
  const customers = Array.isArray(customerStore?.customers) ? customerStore.customers : [];
  const { setCustomers, addCustomer, updateCustomer, removeCustomer } = customerStore || {};
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadCustomers();
    }
  }, [isMounted]);

  const loadCustomers = async () => {
    if (!setCustomers) return;
    try {
      setLoading(true);
      const response = await customerService.getCustomers({ page: 1, pageSize: 100 });
      setCustomers(response.data);
    } catch (error: any) {
      message.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue(customer);
    setModalVisible(true);
  };

  const handleDelete = async (customerId: string) => {
    if (!removeCustomer) return;
    try {
      await customerService.deleteCustomer(customerId);
      removeCustomer(customerId);
      message.success('Customer deleted successfully!');
    } catch (error: any) {
      message.error('Failed to delete customer');
    }
  };

  const handleSubmit = async () => {
    if (!addCustomer || !updateCustomer) return;
    try {
      const values = await form.validateFields();
      
      if (editingCustomer) {
        // Update existing customer
        const updated = await customerService.updateCustomer(editingCustomer._id, values);
        updateCustomer(editingCustomer._id, updated);
        message.success('Customer updated successfully!');
      } else {
        // Create new customer
        const newCustomer = await customerService.createCustomer(values as CreateCustomerDto);
        addCustomer(newCustomer);
        message.success('Customer created successfully!');
        // Reload customers to ensure we have the latest data
        await loadCustomers();
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error?.message || 'Failed to save customer');
    }
  };

  const columns: ColumnsType<Customer> = [
    {
      title: 'Customer Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Active Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Customer"
            description="Are you sure you want to delete this customer?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Don't render table until mounted
  if (!isMounted) {
    return <div style={{ padding: '24px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Customer Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
        >
          Add Customer
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={customers}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} customers`,
        }}
      />

      <Modal
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText={editingCustomer ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true }}
        >
          <Form.Item
            label="Customer Name"
            name="name"
            rules={[{ required: true, message: 'Please enter customer name' }]}
          >
            <Input placeholder="Enter customer name" />
          </Form.Item>

          {editingCustomer && (
            <Form.Item
              label="Active Status"
              name="isActive"
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerManagement;
