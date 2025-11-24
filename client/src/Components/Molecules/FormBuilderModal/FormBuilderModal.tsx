'use client';

import React, { useState, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  Switch,
  Space,
  Card,
  List,
  Typography,
  Divider,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DragOutlined,
} from '@ant-design/icons';
import type { FormField, FieldType } from '@/Interfaces';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface FormBuilderModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (formData: { name: string; description?: string; fields: FormField[] }) => void;
  projectId: string;
  projectName: string;
  existingForm?: { name: string; description?: string; fields: FormField[] } | null;
}



export const FormBuilderModal: React.FC<FormBuilderModalProps> = ({
  open,
  onCancel,
  onSubmit,
  projectId,
  projectName,
  existingForm,
}) => {
  const [form] = Form.useForm();
  const [fields, setFields] = useState<FormField[]>([]);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [fieldForm] = Form.useForm();
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);

  // Initialize fields with default values - only when modal opens
  React.useEffect(() => {
    if (!open) return;

    if (existingForm) {
      form.setFieldsValue({
        formName: existingForm.name,
        formDescription: existingForm.description,
      });
      setFields(existingForm.fields);
    } else {
      // Reset to empty fields for new form
      form.resetFields();
      setFields([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existingForm]);

  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'file', label: 'File Upload' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Button' },
  ];

  const handleAddField = () => {
    fieldForm.resetFields();
    setEditingField(null);
    setIsAddFieldModalOpen(true);
  };

  const handleEditField = (field: FormField) => {
    setEditingField(field);
    fieldForm.setFieldsValue(field);
    setIsAddFieldModalOpen(true);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
    message.success('Field deleted successfully');
  };

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    e.stopPropagation();
    setDraggedFieldId(fieldId);
  };

  const handleDragOver = (e: React.DragEvent, fieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFieldId(fieldId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragOverFieldId(null);
  };

  const handleDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedFieldId || draggedFieldId === targetFieldId) {
      setDraggedFieldId(null);
      setDragOverFieldId(null);
      return;
    }

    const draggedIndex = fields.findIndex((f) => f.id === draggedFieldId);
    const targetIndex = fields.findIndex((f) => f.id === targetFieldId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedFieldId(null);
      setDragOverFieldId(null);
      return;
    }

    const newFields = [...fields];
    const [draggedField] = newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, draggedField);

    // Update order property
    const reorderedFields = newFields.map((field, index) => ({
      ...field,
      order: index,
    }));

    setFields(reorderedFields);
    setDraggedFieldId(null);
    setDragOverFieldId(null);
    message.success('Field order updated');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedFieldId(null);
    setDragOverFieldId(null);
  };

  const handleFieldFormSubmit = () => {
    fieldForm.validateFields().then((values) => {
      if (editingField) {
        // Update existing field
        setFields(
          fields.map((f) =>
            f.id === editingField.id ? { ...f, ...values } : f
          )
        );
        message.success('Field updated successfully');
      } else {
        // Add new field
        const newField: FormField = {
          ...values,
          id: `custom-${Date.now()}`,
          order: fields.length,
          isDefault: false,
        };
        setFields([...fields, newField]);
        message.success('Field added successfully');
      }
      setIsAddFieldModalOpen(false);
      fieldForm.resetFields();
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit({
        name: values.formName,
        description: values.formDescription,
        fields: fields,
      });
      form.resetFields();
      setFields([]);
    });
  };

  const getFieldTypeColor = (type: FieldType) => {
    const colors: Record<FieldType, string> = {
      text: 'blue',
      textarea: 'cyan',
      number: 'green',
      date: 'orange',
      email: 'purple',
      phone: 'magenta',
      file: 'red',
      select: 'geekblue',
      checkbox: 'lime',
      radio: 'gold',
    };
    return colors[type] || 'default';
  };

  return (
    <>
      <Modal
        title={
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {existingForm ? 'Edit Form' : `Create Form for ${projectName}`}
            </Title>
            <Text type="secondary">
              {existingForm ? 'Update form fields and configuration' : 'Define fields for data entry in this project'}
            </Text>
          </div>
        }
        open={open}
        onCancel={onCancel}
        width={900}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {existingForm ? 'Update Form' : 'Create Form'}
          </Button>,
        ]}
      >
        <div style={{ marginTop: '24px' }}>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Form Name"
              name="formName"
              rules={[{ required: true, message: 'Please enter form name' }]}
            >
              <Input
                placeholder="e.g., Invoice Submission Form"
                size="large"
              />
            </Form.Item>

            <Form.Item label="Form Description" name="formDescription">
              <TextArea
                placeholder="Describe the purpose of this form..."
                rows={3}
              />
            </Form.Item>
          </Form>

          <Divider />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <Title level={5} style={{ margin: 0 }}>
                Form Fields ({fields.length})
              </Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <DragOutlined style={{ marginRight: '4px' }} />
                Drag and drop to reorder fields
              </Text>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddField}
            >
              Add Custom Field
            </Button>
          </div>

          <List
            dataSource={fields}
            renderItem={(field) => (
              <Card
                key={field.id}
                draggable
                onDragStart={(e) => handleDragStart(e, field.id)}
                onDragOver={(e) => handleDragOver(e, field.id)}
                onDragLeave={(e) => handleDragLeave(e)}
                onDrop={(e) => handleDrop(e, field.id)}
                onDragEnd={(e) => handleDragEnd(e)}
                style={{
                  marginBottom: '12px',
                  borderLeft: '4px solid #52c41a',
                  cursor: 'move',
                  opacity: draggedFieldId === field.id ? 0.5 : 1,
                  backgroundColor: dragOverFieldId === field.id && draggedFieldId !== field.id ? '#f0f5ff' : 'white',
                  transition: 'all 0.2s',
                  transform: dragOverFieldId === field.id && draggedFieldId !== field.id ? 'scale(1.02)' : 'scale(1)',
                }}
                bodyStyle={{ padding: '16px' }}
              >
                <Row gutter={16} align="middle">
                  <Col flex="auto">
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Space>
                        <DragOutlined style={{ color: '#1890ff', cursor: 'move', fontSize: '16px' }} />
                        <Text strong style={{ fontSize: '15px' }}>
                          {field.label}
                        </Text>
                        {field.required && (
                          <Tag color="red" style={{ margin: 0 }}>
                            Required
                          </Tag>
                        )}

                      </Space>
                      <Space size={12}>
                        <Tag color={getFieldTypeColor(field.type)}>
                          {field.type.toUpperCase()}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          Field Name: <code>{field.name}</code>
                        </Text>
                      </Space>
                    </Space>
                  </Col>
                  <Col>
                    <Space>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditField(field)}
                      >
                        Edit
                      </Button>
                      <Popconfirm
                        title="Delete this field?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDeleteField(field.id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                          Delete
                        </Button>
                      </Popconfirm>
                    </Space>
                  </Col>
                </Row>
              </Card>
            )}
          />
        </div>
      </Modal>

      {/* Add/Edit Field Modal */}
      <Modal
        title={editingField ? 'Edit Field' : 'Add Custom Field'}
        open={isAddFieldModalOpen}
        onCancel={() => {
          setIsAddFieldModalOpen(false);
          fieldForm.resetFields();
        }}
        onOk={handleFieldFormSubmit}
        okText={editingField ? 'Update Field' : 'Add Field'}
        width={600}
      >
        <Form form={fieldForm} layout="vertical" style={{ marginTop: '24px' }}>
          <Form.Item
            label="Field Label"
            name="label"
            rules={[{ required: true, message: 'Please enter field label' }]}
          >
            <Input placeholder="e.g., Customer Name" />
          </Form.Item>

          <Form.Item
            label="Field Name (Variable)"
            name="name"
            rules={[
              { required: true, message: 'Please enter field name' },
              {
                pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                message: 'Field name must start with letter or underscore, and contain only letters, numbers, and underscores',
              },
            ]}
            tooltip="Used internally. Use lowercase letters, numbers, and underscores only."
          >
            <Input placeholder="e.g., customer_name" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Field Type"
                name="type"
                rules={[{ required: true, message: 'Please select field type' }]}
              >
                <Select placeholder="Select field type">
                  {fieldTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Required Field"
                name="required"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Placeholder Text" name="placeholder">
            <Input placeholder="e.g., Enter customer name" />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) => {
              const fieldType = getFieldValue('type');
              if (fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox') {
                return (
                  <Form.Item
                    label="Options (comma-separated)"
                    name="options"
                    rules={[{ required: true, message: 'Please enter options' }]}
                  >
                    <Select
                      mode="tags"
                      placeholder="Type and press enter to add options"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default FormBuilderModal;
