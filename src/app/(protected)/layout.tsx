import Layout from "@/components/Layout";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <Layout>{children}</Layout>;
}
