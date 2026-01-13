import { motion } from 'framer-motion';
import { ArrowRight, Github, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative container px-4 pt-20 pb-12 md:pt-32 md:pb-20">
        <motion.div
          className="flex flex-col items-center text-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Badge variant="outline" className="px-4 py-1.5 text-sm border-primary/30 bg-primary/5">
              <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
              Open Source · Licença MIT
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Lance seu SaaS em{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              semanas
            </span>
            , não meses
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Template completo com autenticação, billing, multi-tenancy e arquitetura
            limpa. Pronto para produção. 100% gratuito.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
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
            <Button size="xl" variant="outline" className="group" asChild>
              <a href="#features">
                Ver o que está incluso
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              NestJS + React
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              TypeScript 100%
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Clean Architecture
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Stripe Integrado
            </span>
          </motion.div>
        </motion.div>

        {/* Terminal preview */}
        <motion.div
          className="mt-16 md:mt-24 relative max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          {/* Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-2xl opacity-50" />

          {/* Terminal */}
          <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">terminal</span>
            </div>

            {/* Terminal content */}
            <div className="p-4 md:p-6 font-mono text-sm">
              <div className="space-y-2">
                <p>
                  <span className="text-muted-foreground">$</span>{' '}
                  <span className="text-primary">git clone</span>{' '}
                  <span className="text-foreground">fnd-quicklaunch</span>
                </p>
                <p>
                  <span className="text-muted-foreground">$</span>{' '}
                  <span className="text-primary">npm install</span>
                </p>
                <p>
                  <span className="text-muted-foreground">$</span>{' '}
                  <span className="text-primary">npm run dev</span>
                </p>
                <p className="text-muted-foreground mt-4">
                  {' '}API rodando em{' '}
                  <span className="text-primary">localhost:3001</span>
                </p>
                <p className="text-muted-foreground">
                  {' '}Frontend rodando em{' '}
                  <span className="text-secondary">localhost:3000</span>
                </p>
                <p className="text-green-500 mt-4">
                  ✓ Auth, Billing, Multi-tenancy... tudo pronto!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
