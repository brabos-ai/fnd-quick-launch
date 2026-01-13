import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'QuickLaunch',
    description: 'Template Open Source',
    price: 'Grátis',
    priceNote: 'para sempre',
    features: [
      'Template completo no GitHub',
      'Auth + Billing + Multi-tenancy',
      'Clean Architecture + CQRS',
      'Documentação técnica',
      'Licença MIT',
    ],
    cta: 'Ver no GitHub',
    ctaLink: 'https://github.com/xmaiconx/fnd-easyflow-template',
    ctaIcon: Github,
    highlighted: false,
    gradient: 'from-blue-500',
  },
  {
    name: 'FND Completo',
    description: 'FND PRO + Template + Método',
    price: 'Consulte',
    priceNote: 'vagas limitadas',
    features: [
      'FND PRO (Tech Lead Virtual)',
      'Template QuickLaunch + suporte',
      'SalesFlow (Landing Page com IA)',
      'Treinamento modular completo',
      'Comunidade exclusiva',
      'Mentorias ao vivo',
    ],
    cta: 'Entrar na Fábrica',
    ctaLink: 'https://brabos.ai',
    ctaIcon: ArrowRight,
    highlighted: true,
    gradient: 'from-orange-500',
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            className="text-primary font-medium mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Escolha seu caminho
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="block">O código é <span className="text-blue-500">grátis</span>.</span>
            <span className="block mt-2">
              O <span className="text-orange-500">FND</span> é o que faz você{' '}
              <span className="text-orange-500">lançar</span>.
            </span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Template open source para quem quer fazer sozinho.
            <br className="hidden md:block" />
            FND completo para quem quer resultado de verdade.
          </motion.p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'relative h-full flex flex-col',
                  plan.highlighted && 'border-orange-500 shadow-lg shadow-orange-500/10'
                )}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Recomendado
                  </Badge>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div
                    className={cn(
                      'inline-flex items-center justify-center h-12 w-12 rounded-full mx-auto mb-4',
                      plan.highlighted ? 'bg-orange-500/10' : 'bg-blue-500/10'
                    )}
                  >
                    <div
                      className={cn(
                        'h-6 w-6 rounded-full',
                        plan.highlighted
                          ? 'bg-gradient-to-br from-orange-500 to-red-500'
                          : 'bg-gradient-to-br from-blue-500 to-blue-600'
                      )}
                    />
                  </div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {plan.priceNote}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check
                          className={cn(
                            'h-5 w-5 flex-shrink-0 mt-0.5',
                            plan.highlighted ? 'text-orange-500' : 'text-blue-500'
                          )}
                        />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    className={cn(
                      'w-full group',
                      plan.highlighted &&
                        'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                    )}
                    size="lg"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <a
                      href={plan.ctaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <plan.ctaIcon className="mr-2 h-4 w-4" />
                      {plan.cta}
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Value proposition */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-8 flex-wrap justify-center text-muted-foreground text-sm">
            <span>✓ Economize +3 meses de desenvolvimento</span>
            <span>✓ Arquitetura validada em produção</span>
            <span>✓ Suporte da comunidade FND</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
