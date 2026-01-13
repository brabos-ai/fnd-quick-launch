import { motion } from 'framer-motion';
import { ArrowDown, Brain, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const highlights = [
  'Arquitetura planejada antes da primeira linha de código',
  'Segurança auditada em tempo real durante o desenvolvimento',
  'Padrões consistentes para manutenção e evolução',
  '15+ anos de experiência encapsulados em inteligência',
];

export function BuiltWithFND() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-orange-500/5 to-background">
      <div className="container px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
            <Brain className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-500">
              Por trás do template
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Construído com{' '}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              FND PRO
            </span>
          </h2>

          {/* Description */}
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Este template não foi criado no improviso. Foi construído usando a
            metodologia FND — um sistema de inteligência que transforma qualquer IA
            de código em um Tech Lead estruturado.
          </p>

          {/* Highlights */}
          <div className="grid sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto mb-8">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <div className="h-5 w-5 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-orange-500" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button variant="ghost" size="lg" className="group text-orange-500" asChild>
            <a href="#fnd-pro">
              Conheça a metodologia completa
              <ArrowDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
