import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, FlaskConical, BarChart3, Atom, Microscope, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-microscopy.jpg";

const features = [
  {
    icon: Microscope,
    title: "Image Reconstruction",
    desc: "Denoise and enhance low-quality microscopy images using autoencoder-based reconstruction.",
  },
  {
    icon: Atom,
    title: "Nuclei Segmentation",
    desc: "U-Net powered segmentation with Dice & IoU metrics and mask overlay visualization.",
  },
  {
    icon: BarChart3,
    title: "Nanoparticle Analytics",
    desc: "Size distribution, circularity, aggregation detection, and density characterization.",
  },
  {
    icon: FlaskConical,
    title: "Drug Screening",
    desc: "Rank nanoparticle candidates by stability, uniformity, and interaction strength.",
  },
];

const Index = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="relative h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Fluorescent cell microscopy" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs font-mono text-primary">AI-Powered Research Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6">
            Generative Microscopy
            <br />
            <span className="text-glow text-primary">Image Reconstruction</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
            Enhance microscopic cell images, segment nuclei, characterize nanoparticles, and accelerate nanomedicine discovery workflows with AI.
          </p>

          <div className="flex gap-4">
            <Link to="/analyze">
              <Button size="lg" className="gradient-primary text-primary-foreground font-semibold px-8 gap-2">
                <Upload className="w-4 h-4" /> Start Analysis
              </Button>
            </Link>
            <Link to="/screening">
              <Button size="lg" variant="outline" className="border-border/60 gap-2">
                Screening Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Features */}
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Research Modules</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            A complete pipeline for nanomedicine image analysis and drug candidate evaluation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-6 hover:box-glow transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 border-t border-border/30">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to analyze?</h2>
        <p className="text-muted-foreground mb-8">Upload your first microscopy image and get instant AI-powered insights.</p>
        <Link to="/analyze">
          <Button size="lg" className="gradient-primary text-primary-foreground font-semibold px-8 gap-2">
            <Microscope className="w-4 h-4" /> Launch NanoScope
          </Button>
        </Link>
      </div>
    </section>
  </div>
);

export default Index;
