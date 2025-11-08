import Header from "@/app/components/layout/Header";
import BackgroundDecorations from "@/app/components/layout/BackgroundDecorations";

export default function AppLayout({ children }) {
  return (
    <BackgroundDecorations>
      <Header />
      {children}
    </BackgroundDecorations>
  );
}
