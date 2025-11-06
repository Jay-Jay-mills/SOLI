import './globals.css';
import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { AuthProvider } from '@/AuthProvider';
import { antdTheme } from '@/Theme';

export const metadata: Metadata = {
  title: 'SOLI Enterprise Portal',
  description: 'Modern enterprise application portal',
  keywords: ['enterprise', 'portal', 'management'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider theme={antdTheme}>
            <AuthProvider>{children}</AuthProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
