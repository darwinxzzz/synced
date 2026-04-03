import { Navbar } from "~/app/_components/marketing/Navbar";
import { Footer } from "~/app/_components/marketing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
