import { motion } from 'framer-motion';
import {
  Shield,
  CreditCard,
  Users,
  Layers,
  Zap,
  Database,
  Bell,
  GitBranch,
  Check,
} from 'lucide-react';

const mainFeatures = [
  {
    icon: Shield,
    title: 'Autenticação Completa',
    description:
      'Sistema completo de auth pronto para produção. Não perca tempo reinventando a roda.',
    items: [
      'JWT + Refresh tokens automático',
      'Recuperação de senha por email',
      'Verificação de email',
      'Proteção contra brute force',
    ],
  },
  {
    icon: CreditCard,
    title: 'Billing com Stripe',
    description:
      'Monetize desde o dia 1. Toda a integração com Stripe já configurada e testada.',
    items: [
      'Checkout Session integrado',
      'Customer Portal pronto',
      'Webhooks com retry',
      'Múltiplos planos e preços',
    ],
  },
];

const secondaryFeatures = [
  {
    icon: Users,
    title: 'Multi-tenancy',
    description: 'Workspaces isolados com sistema de convites e roles.',
  },
  {
    icon: Layers,
    title: 'Clean Architecture',
    description: 'CQRS, Repository pattern, DI. Código escalável.',
  },
  {
    icon: Zap,
    title: 'Background Jobs',
    description: 'BullMQ + Redis para processamento assíncrono.',
  },
  {
    icon: Database,
    title: 'Type-Safe SQL',
    description: 'Kysely + TypeScript. Zero SQL injection.',
  },
  {
    icon: Bell,
    title: 'Webhooks',
    description: 'Receba eventos externos com retry automático.',
  },
  {
    icon: GitBranch,
    title: 'Deploy Ready',
    description: 'Railway + Cloudflare. CI/CD configurado.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32 overflow-hidden">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            className="text-primary font-medium mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            O que está incluso
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Tudo que você precisa para{' '}
            <span className="text-primary">lançar rápido</span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Semanas de desenvolvimento economizadas. Foque no que importa: seu produto.
          </motion.p>
        </div>

        {/* Main Features - Alternating Layout */}
        <div className="space-y-24 md:space-y-32 mb-24">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              className={`flex flex-col ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } items-center gap-12 md:gap-16`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{feature.title}</span>
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                  {feature.description}
                </h3>
                <ul className="space-y-3">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-muted-foreground">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <div className="flex-1 w-full">
                <div className="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute inset-4 rounded-xl bg-card/50 backdrop-blur border">
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500/50" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                        <div className="h-3 w-3 rounded-full bg-green-500/50" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                        <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                        <div className="h-3 w-2/3 rounded bg-primary/20 animate-pulse" />
                        <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
                      </div>
                    </div>
                  </div>
                  {/* Glow */}
                  <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-primary/10 rounded-full blur-3xl" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Secondary Features - Minimal List */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-xl font-semibold text-muted-foreground">
              E mais...
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {secondaryFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="h-12 w-12 mx-auto rounded-xl bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-muted-foreground hidden md:block">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tech stack */}
        <motion.div
          className="mt-20 pt-16 border-t"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-muted-foreground text-center mb-6">
            Construído com tecnologias modernas
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {[
              'NestJS',
              'React',
              'TypeScript',
              'PostgreSQL',
              'Redis',
              'Stripe',
              'Tailwind',
              'Shadcn/ui',
            ].map((tech) => (
              <span
                key={tech}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
