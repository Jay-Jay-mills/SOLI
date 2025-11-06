'use client';

import { Result, Button } from 'antd';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/Constants';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary" onClick={() => router.push(ROUTES.DASHBOARD)}>
            Back Home
          </Button>
        }
      />
    </div>
  );
}
