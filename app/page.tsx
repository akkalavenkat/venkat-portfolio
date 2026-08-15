import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import Projects from "@/app/components/Projects";
import TechStack from "@/app/components/TechStack";
import BlogPreview from "@/app/components/BlogPreview";
import ContactSection from "@/app/components/ContactSection";
import Footer from "@/app/components/Footer";

export default function Page() {
  return (
    <main className="ds-page min-h-screen transition-colors">
      <Navbar />
      <Hero />
      <Projects />
      <TechStack />
      <BlogPreview />
      <ContactSection />
      <Footer />
    </main>
  );
}
