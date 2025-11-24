import React from 'react';
import { Modal, Descriptions, Tag, Button } from 'antd';
import { UserGroup, User } from '@/Interfaces';
import { formatDate } from '@/Helpers';

interface ViewUserGroupModalProps {
    visible: boolean;
    onCancel: () => void;
    userGroup: UserGroup | null;
}

export const ViewUserGroupModal: React.FC<ViewUserGroupModalProps> = ({
    visible,
    onCancel,
    userGroup,
}) => {
    if (!userGroup) return null;

    return (
        <Modal
            title="User Group Details"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>
                    Close
                </Button>,
            ]}
            width={700}
        >
            <Descriptions bordered column={1}>
                <Descriptions.Item label="Group Name">{userGroup.name}</Descriptions.Item>
                <Descriptions.Item label="Description">{userGroup.description}</Descriptions.Item>
                <Descriptions.Item label="Status">
                    <Tag color={userGroup.isActive ? 'green' : 'red'}>
                        {userGroup.isActive ? 'Active' : 'Inactive'}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Admins">
                    {userGroup.admins && userGroup.admins.length > 0 ? (
                        userGroup.admins.map((admin: string | User, index) => {
                            const adminName = typeof admin === 'string' ? admin : admin.username;
                            return (
                                <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                                    {adminName}
                                </Tag>
                            );
                        })
                    ) : (
                        'No admins'
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Members">
                    {userGroup.users && userGroup.users.length > 0 ? (
                        userGroup.users.map((user: string | User, index) => {
                            const userName = typeof user === 'string' ? user : user.username;
                            return (
                                <Tag key={index} color="green" style={{ marginBottom: 4 }}>
                                    {userName}
                                </Tag>
                            );
                        })
                    ) : (
                        'No members'
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Created By">{userGroup.createdBy}</Descriptions.Item>
                <Descriptions.Item label="Created At">{formatDate(userGroup.created)}</Descriptions.Item>
                {userGroup.updatedBy && (
                    <Descriptions.Item label="Updated By">{userGroup.updatedBy}</Descriptions.Item>
                )}
                {userGroup.updated && (
                    <Descriptions.Item label="Updated At">{formatDate(userGroup.updated)}</Descriptions.Item>
                )}
            </Descriptions>
        </Modal>
    );
};
