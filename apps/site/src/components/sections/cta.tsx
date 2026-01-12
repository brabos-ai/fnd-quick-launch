import { motion } from 'framer-motion';
import { ArrowRight, Github, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

      <div className="container px-4 relative">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Icon */}
          <motion.div
            className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 border border-primary/30 mb-8"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <Rocket className="h-8 w-8 text-primary" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Pronto para{' '}
            <span className="text-primary">lançar</span>?
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Clone o template, customize para seu negócio e lance em semanas.
            100% gratuito, open source, licença MIT.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" className="group" asChild>
              <a
                href="https://github.com/xmaiconx/fnd-quick-launch"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-5 w-5" />
                Baixar Template
              </a>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="group border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/5"
              asChild
            >
              <a href="https://brabos.ai/fnd-pro" target="_blank" rel="noopener noreferrer">
                Conhecer o FND Pro
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>

          {/* Trust */}
          <p className="mt-8 text-sm text-muted-foreground">
            Criado por{' '}
            <a
              href="https://linkedin.com/in/maiconmatsubara"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              Maicon Matsubara
            </a>
            {' '}· Tech Lead com 15+ anos de experiência
          </p>
        </motion.div>
      </div>
    </section>
  );
}
