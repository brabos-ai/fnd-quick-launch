import { motion } from 'framer-motion';
import { Download, Wrench, Rocket } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Download,
    title: 'Clone o template',
    description:
      'Baixe o QuickLaunch e rode npm install. Em 5 minutos seu ambiente está pronto com PostgreSQL, Redis e todas as dependências.',
    code: 'git clone fnd-quicklaunch && npm install',
  },
  {
    step: '02',
    icon: Wrench,
    title: 'Customize para seu negócio',
    description:
      'Adapte o esquema do banco, configure suas credenciais (Stripe, Resend) e comece a desenvolver suas features específicas.',
    code: 'npm run dev # API + Frontend rodando',
  },
  {
    step: '03',
    icon: Rocket,
    title: 'Deploy em produção',
    description:
      'Push para o GitHub e o deploy automático cuida do resto. Railway para backend, Cloudflare Pages para frontend.',
    code: 'git push origin main # Deploy automático',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            className="text-primary font-medium mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Como funciona
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Do zero ao deploy em{' '}
            <span className="text-primary">3 passos</span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Sem configuração complexa. Sem perda de tempo.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-px bg-border md:left-8" />
              )}

              <div className="flex gap-6 md:gap-8 pb-12 last:pb-0">
                {/* Step number */}
                <div className="relative flex-shrink-0">
                  <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <step.icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-primary">
                      {step.step}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">{step.description}</p>

                  {/* Code snippet */}
                  <div className="inline-block rounded-lg bg-card border px-4 py-2 font-mono text-sm">
                    <span className="text-muted-foreground">$ </span>
                    <span className="text-primary">{step.code}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
