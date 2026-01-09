import { motion } from 'framer-motion';
import { ArrowRight, Brain, Layers, Shield, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

const capabilities = [
  {
    icon: Layers,
    title: 'Arquitetura Planejada',
    description: 'Estrutura de banco e rotas definidas antes da primeira linha de código.',
  },
  {
    icon: Shield,
    title: 'Segurança Auditada',
    description: 'Vulnerabilidades bloqueadas em tempo real durante o desenvolvimento.',
  },
  {
    icon: Wrench,
    title: 'Código Mantível',
    description: 'Padrões consistentes que facilitam manutenção e evolução.',
  },
];

export function BuiltWithFND() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background via-orange-500/5 to-background">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Brain className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-500">Por trás do template</span>
            </motion.div>

            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Construído com{' '}
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                FND TECHLEAD
              </span>
            </motion.h2>

            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Este template não foi criado no improviso. Foi construído usando o FND TECHLEAD —
              um sistema de inteligência que atua como Tech Lead virtual, garantindo que cada
              decisão técnica seja tomada com a experiência de 15+ anos de desenvolvimento.
            </motion.p>
          </div>

          {/* Capabilities */}
          <motion.div
            className="grid md:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                className="text-center p-6 rounded-xl border border-orange-500/10 bg-card/50"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-orange-500/10 text-orange-500 mb-4">
                  <cap.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground">{cap.description}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-muted-foreground mb-6">
              Quer construir seu SaaS com a mesma metodologia?
            </p>
            <Button
              size="lg"
              className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              asChild
            >
              <a href="https://brabos.ai" target="_blank" rel="noopener noreferrer">
                Conhecer a Fábrica de Negócios Digitais
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
