import { Header } from "@/components/Header";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex flex-col items-stretch h-full">
      <Header />

      <div className=" h-[calc(100%-60px)] overflow-auto">{children}</div>
    </div>
  );
};
