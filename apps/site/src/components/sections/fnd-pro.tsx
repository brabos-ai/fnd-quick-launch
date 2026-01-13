import { motion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  Cpu,
  Layers,
  Shield,
  Sparkles,
  Target,
  Wrench,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const techleadCores = [
  {
    icon: Layers,
    title: 'Architecture Core',
    subtitle: 'Arquiteto de Software',
    description:
      'Planeja estrutura de banco e rotas ANTES de qualquer código. Nada de improvisar.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-500',
  },
  {
    icon: Shield,
    title: 'Security Core',
    subtitle: 'Engenheiro de Segurança',
    description:
      'Monitora criação de código em tempo real. Bloqueia vulnerabilidades automaticamente.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    textColor: 'text-green-500',
  },
  {
    icon: Wrench,
    title: 'Autonomous Fix',
    subtitle: 'SRE Sênior',
    description:
      'Diagnostica erros complexos e coordena correção. Resolve o que a IA comum não consegue.',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    textColor: 'text-purple-500',
  },
];

const comparisonTable = [
  {
    aspect: 'Abordagem',
    vibeCoder: '"Vai fazendo aí"',
    techOwner: 'Arquitetura planejada',
  },
  {
    aspect: 'Segurança',
    vibeCoder: 'Descobre quando hackeia',
    techOwner: 'Auditoria em tempo real',
  },
  {
    aspect: 'Erros',
    vibeCoder: 'Pânico e tentativa-e-erro',
    techOwner: 'Diagnóstico estruturado',
  },
  {
    aspect: 'Resultado',
    vibeCoder: 'Projeto Frankenstein',
    techOwner: 'SaaS pronto pra escalar',
  },
];

export function FNDPro() {
  return (
    <section id="fnd-pro" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-orange-500/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl" />

      <div className="container px-4 relative">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Cpu className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-500">
              Metodologia FND Pro
            </span>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Instale um{' '}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              cérebro de Tech Lead
            </span>{' '}
            no seu projeto
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            O FND Pro transforma qualquer IA de código em um Tech Lead estruturado.
            Você deixa de ser um "Vibe Coder" e se torna um{' '}
            <span className="text-foreground font-semibold">Tech Owner</span> — dono
            da sua tecnologia.
          </motion.p>
        </div>

        {/* Big Idea Quote */}
        <motion.div
          className="max-w-4xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="relative p-8 md:p-10 bg-gradient-to-br from-orange-500/5 via-card to-red-500/5 border-orange-500/20">
            <div className="absolute top-4 left-4 text-6xl text-orange-500/20 font-serif">
              "
            </div>
            <blockquote className="relative z-10 text-center">
              <p className="text-xl md:text-2xl font-medium mb-4 leading-relaxed">
                A IA sabe escrever código, mas não sabe construir empresas. Sem
                gestão, o projeto vira caos. O{' '}
                <span className="text-orange-500">FND PRO</span> é o cérebro
                que você instala no coração do seu projeto para gerenciar, auditar e
                liderar a construção do seu software.
              </p>
              <footer className="text-muted-foreground">
                — Maicon Matsubara, criador da metodologia FND
              </footer>
            </blockquote>
          </Card>
        </motion.div>

        {/* Vibe Coder vs Tech Owner Comparison */}
        <motion.div
          className="max-w-4xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-10">
            De Vibe Coder para{' '}
            <span className="text-orange-500">Tech Owner</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Vibe Coder Column */}
            <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Target className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-400">Vibe Coder</h4>
                  <p className="text-xs text-muted-foreground">
                    Amador que só conversa com IA
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                {comparisonTable.map((item) => (
                  <li
                    key={item.aspect}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="text-red-500/50">✕</span>
                    <span>
                      <span className="text-foreground/70">{item.aspect}:</span>{' '}
                      {item.vibeCoder}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Owner Column */}
            <div className="p-6 rounded-2xl border border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-400">Tech Owner</h4>
                  <p className="text-xs text-muted-foreground">
                    CEO com FND PRO instalado
                  </p>
                </div>
              </div>
              <ul className="space-y-3">
                {comparisonTable.map((item) => (
                  <li
                    key={item.aspect}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <span className="text-green-500">✓</span>
                    <span>
                      <span className="text-foreground/70">{item.aspect}:</span>{' '}
                      {item.techOwner}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* FND PRO Cores */}
        <div className="mb-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge
              variant="outline"
              className="mb-4 border-orange-500/30 bg-orange-500/5"
            >
              <Sparkles className="h-3 w-3 mr-1 text-orange-500" />
              Os Três Núcleos
            </Badge>
            <h3 className="text-2xl md:text-3xl font-bold">
              O que o FND PRO faz por você
            </h3>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {techleadCores.map((core, index) => (
              <motion.div
                key={core.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`h-full p-6 ${core.bgColor} border ${core.borderColor} hover:scale-[1.02] transition-transform`}
                >
                  <div
                    className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${core.color} text-white mb-4`}
                  >
                    <core.icon className="h-6 w-6" />
                  </div>
                  <h4 className={`text-lg font-bold mb-1 ${core.textColor}`}>
                    {core.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    {core.subtitle}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {core.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* What's Included */}
        <motion.div
          className="max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="p-8 bg-card/50 border-border/50">
            <h3 className="text-xl font-bold mb-6 text-center">
              O que está incluso no FND Pro
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span>FND PRO completo (3 núcleos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span>META SALES (Landing Pages de alta conversão)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span>30+ skills de desenvolvimento</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span>20+ commands estruturados</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span>WhatsApp exclusivo de alunos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span>Encontros ao vivo semanais</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span>Suporte prioritário</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span>Atualizações contínuas</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            O QuickLaunch é o template gratuito. O{' '}
            <span className="text-orange-500 font-medium">FND Pro</span> é a
            metodologia completa para construir e vender seu SaaS como um
            profissional.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              asChild
            >
              <a href="https://brabos.ai/fnd-pro" target="_blank" rel="noopener noreferrer">
                <Cpu className="mr-2 h-5 w-5" />
                Conhecer o FND Pro
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Investimento: R$ 697/ano · Garantia de 7 dias
          </p>
        </motion.div>
      </div>
    </section>
  );
}
