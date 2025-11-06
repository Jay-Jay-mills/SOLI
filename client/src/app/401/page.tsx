'use client';

import { Result, Button } from 'antd';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/Constants';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" onClick={() => router.push(ROUTES.DASHBOARD)}>
            Back to Dashboard
          </Button>
        }
      />
    </div>
  );
}
