'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Upload,
  Select,
  Checkbox,
  Radio,
  Button,
  Space,
  message,
} from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import type { FormField, FormSubmission } from '@/Interfaces';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

interface DataEntryModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: Record<string, any>) => void;
  formFields: FormField[];
  formName: string;
  editingData?: FormSubmission | null;
}

export const DataEntryModal: React.FC<DataEntryModalProps> = ({
  open,
  onCancel,
  onSubmit,
  formFields,
  formName,
  editingData,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any>({});

  useEffect(() => {
    if (editingData && open) {
      // Populate form with editing data
      const formValues: Record<string, any> = {};
      formFields.forEach((field) => {
        let value = editingData.data[field.name];
        
        // Convert date strings to dayjs objects
        if (field.type === 'date' && value) {
          value = dayjs(value);
        }
        
        formValues[field.name] = value;
      });
      
      form.setFieldsValue(formValues);
    } else if (!editingData) {
      form.resetFields();
      setFileList({});
    }
  }, [editingData, open, form, formFields]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const submissionData: Record<string, any> = {};
      
      formFields.forEach((field) => {
        let value = values[field.name];
        
        // Convert dayjs objects to ISO strings for dates
        if (field.type === 'date' && value) {
          value = value.toISOString();
        }
        
        // Handle file uploads
        if (field.type === 'file' && fileList[field.name]) {
          value = fileList[field.name].map((file: any) => file.name).join(', ');
        }
        
        submissionData[field.name] = value;
      });
      
      onSubmit(submissionData);
      form.resetFields();
      setFileList({});
    });
  };

  const renderField = (field: FormField) => {
    const commonRules = [
      {
        required: field.required,
        message: `${field.label} is required`,
      },
    ];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Form.Item
            key={field.id}
            label={field.label}
            name={field.name}
            rules={[
              ...commonRules,
              ...(field.type === 'email'
                ? [{ type: 'email' as const, message: 'Please enter a valid email' }]
                : []),
              ...(field.validation?.minLength
                ? [{ min: field.validation.minLength, message: `Minimum ${field.validation.minLength} characters` }]
                : []),
              ...(field.validation?.maxLength
                ? [{ max: field.validation.maxLength, message: `Maximum ${field.validation.maxLength} characters` }]
                : []),
            ]}
          >
            <Input
              placeholder={field.placeholder}
              size="large"
              type={field.type === 'phone' ? 'tel' : field.type}
            />
          </Form.Item>
        );

      case 'textarea':
        return (
          <Form.Item
            key={field.id}
            label={field.label}
            name={field.name}
            rules={commonRules}
          >
            <TextArea
              placeholder={field.placeholder}
              rows={4}
              size="large"
            />
          </Form.Item>
        );

      case 'number':
        return (
          <Form.Item
            key={field.id}
            label={field.label}
            name={field.name}
            rules={commonRules}
          >
            <InputNumber
              placeholder={field.placeholder}
              size="large"
              style={{ width: '100%' }}
              min={field.validation?.min}
              max={field.validation?.max}
            />
          </Form.Item>
        );

      case 'date':
        return (
          <Form.Item
            key={field.id}
            label={field.label}
            name={field.name}
            rules={commonRules}
          >
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Form.Item>
        );

      case 'file':
        return (
          <Form.Item
            key={field.id}
            label={field.label}
            name={field.name}
            rules={commonRules}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Dragger
              beforeUpload={(file) => {
                setFileList((prev: any) => ({
                  ...prev,
                  [field.name]: [...(prev[field.name] || []), file],
                }));
                return false; // Prevent auto upload
              }}
              onRemove={(file) => {
                setFileList((prev: any) => ({
                  ...prev,
                  [field.name]: prev[field.name].filter((f: any) => f.uid !== file.uid),
                }));
              }}
              maxCount={5}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to upload</p>
              <p className="ant-upload-hint">
                Support for single or bulk upload. Maximum 5 files.
              </p>
            </Dragger>
          </Form.Item>
        );

      case 'select':
        return (
          <Form.Item
            key={field.id}
            label={field.label}
            name={field.name}
            rules={commonRules}
          >
            <Select
              placeholder={field.placeholder || `Select ${field.label}`}
              size="large"
            >
              {field.options?.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 'checkbox':
        return (
          <Form.Item
            key={field.id}
            label={field.label}
            name={field.name}
            valuePropName="checked"
          >
            <Checkbox.Group options={field.options} />
          </Form.Item>
        );

      case 'radio':
        return (
          <Form.Item
            key={field.id}
            label={field.label}
            name={field.name}
            rules={commonRules}
          >
            <Radio.Group>
              <Space direction="vertical">
                {field.options?.map((option) => (
                  <Radio key={option} value={option}>
                    {option}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title={editingData ? `Edit Entry - ${formName}` : `Add Entry - ${formName}`}
      open={open}
      onCancel={() => {
        form.resetFields();
        setFileList({});
        onCancel();
      }}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          {editingData ? 'Update Entry' : 'Submit Entry'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: '24px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '12px' }}
      >
        {formFields
          .sort((a, b) => a.order - b.order)
          .map((field) => renderField(field))}
      </Form>
    </Modal>
  );
};

export default DataEntryModal;
