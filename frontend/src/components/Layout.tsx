import { Header } from "@/components/Header";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex flex-col items-stretch container">
      <Header />

      <div className="py-8">{children}</div>
    </div>
  );
};
