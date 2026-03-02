import { Navbar } from "@/components/Navbar";
import { ScarcityBanner } from "@/components/ScarcityBanner";
import { Hero } from "@/components/Hero";
import { SocialProof } from "@/components/SocialProof";
import { ProblemSolution } from "@/components/ProblemSolution";
import { AhaMoment } from "@/components/AhaMoment";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-background text-white selection:bg-primary-start/30">
      <Navbar user={session?.user} />
      <ScarcityBanner />
      <Hero />
      <SocialProof />
      <ProblemSolution />
      <AhaMoment />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
