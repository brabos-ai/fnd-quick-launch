import { motion } from 'framer-motion';
import { AlertTriangle, Bug, Shield, TrendingDown } from 'lucide-react';

const problems = [
  {
    icon: Bug,
    title: 'Quebra do nada',
    description: 'O código até funciona... até você adicionar uma feature nova e tudo explodir.',
  },
  {
    icon: TrendingDown,
    title: 'Não escala',
    description: 'Funciona com 10 usuários, trava com 100. Arquitetura de amador.',
  },
  {
    icon: Shield,
    title: 'Inseguro',
    description: 'Seus dados (e dos seus clientes) expostos. SQL injection, XSS, CSRF...',
  },
  {
    icon: AlertTriangle,
    title: 'Impossível de manter',
    description: 'Cada mudança gera 3 bugs novos. Código espaguete que ninguém entende.',
  },
];

export function Problem() {
  return (
    <section id="problema" className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            className="text-red-400 font-medium mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            O problema que ninguém te conta
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            A IA sabe escrever código.{' '}
            <span className="text-red-400">Mas não sabe construir empresas.</span>
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Você já gastou horas (ou dias) conversando com ChatGPT, Cursor, Windsurf...
            O código até sai. Mas e depois?
          </motion.p>
        </div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="h-full p-6 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                  <problem.icon className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                <p className="text-sm text-muted-foreground">{problem.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom statement */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-block p-6 rounded-xl border border-border bg-card">
            <p className="text-xl md:text-2xl font-bold mb-2">
              Sem gestão técnica, seu projeto é um{' '}
              <span className="text-red-400">castelo de cartas</span> esperando o vento.
            </p>
            <p className="text-muted-foreground">
              90% dos projetos criados com IA quebram em 3 meses.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
