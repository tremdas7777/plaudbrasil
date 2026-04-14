import { useEffect } from "react";
import Layout from "@/components/Layout";
import HeroSection from "@/components/home/HeroSection";
import TrustedBySection from "@/components/home/TrustedBySection";
import ProductivitySection from "@/components/home/ProductivitySection";
import ProductsSection from "@/components/home/ProductsSection";
import IntelligenceSection from "@/components/home/IntelligenceSection";
import SecuritySection from "@/components/home/SecuritySection";
import MediaSection from "@/components/home/MediaSection";
import { trackEvent } from "@/lib/funnelTracking";

const Index = () => {
  useEffect(() => { trackEvent('visitor'); }, []);
  return (
  <Layout>
    <HeroSection />
    <TrustedBySection />
    <ProductivitySection />
    <ProductsSection />
    <IntelligenceSection />
    <SecuritySection />
    <MediaSection />
  </Layout>
  );
};

export default Index;
