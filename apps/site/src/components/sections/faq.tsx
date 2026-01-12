import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'O template é realmente grátis?',
    answer:
      'Sim! O FND SaaS QuickLaunch é 100% open source sob licença MIT. Você pode usar para projetos comerciais, modificar como quiser e não precisa pagar nada. O template inclui auth, billing, multi-tenancy e arquitetura completa.',
  },
  {
    question: 'Qual a diferença entre usar só o template e entrar na FND?',
    answer:
      'O template é o código. A FND é o ecossistema completo: você ganha o FND PRO (Tech Lead Virtual que gerencia seu desenvolvimento), treinamento modular, comunidade exclusiva, mentorias ao vivo e suporte. É a diferença entre ter as ferramentas e ter quem te ensina a usar.',
  },
  {
    question: 'Preciso saber programar para usar?',
    answer:
      'Para usar apenas o template: sim, você precisa de conhecimento técnico em TypeScript, React e NestJS. Para usar o FND PRO: não necessariamente. O FND PRO assume as decisões técnicas e gerencia a IA que escreve o código. Você foca na visão de negócio.',
  },
  {
    question: 'O que é o FND PRO exatamente?',
    answer:
      'É um sistema de inteligência que funciona como um Tech Lead virtual. Ele planeja arquitetura antes do código ser escrito, audita segurança em tempo real, diagnostica e corrige erros automaticamente. Pense nele como ter um engenheiro sênior de R$30k/mês trabalhando no seu projeto.',
  },
  {
    question: 'Quanto tempo economizo usando o QuickLaunch?',
    answer:
      'Em média, 2-4 meses de desenvolvimento. Isso inclui: setup de auth (2-3 semanas), billing com Stripe (2-4 semanas), multi-tenancy (2-3 semanas), infra de background jobs (1-2 semanas), e arquitetura base (2-4 semanas). Tudo já está pronto e testado em produção.',
  },
  {
    question: 'Posso usar para projetos comerciais?',
    answer:
      'Sim! O template tem licença MIT — use para quantos projetos comerciais quiser. A única coisa que você não pode fazer é redistribuir o template como se fosse seu produto.',
  },
  {
    question: 'O template recebe atualizações?',
    answer:
      'Sim! O QuickLaunch é ativamente mantido. Atualizamos conforme novas versões do NestJS, React e outras dependências são lançadas, além de melhorias de segurança e novas features. Quem está na FND recebe atualizações prioritárias.',
  },
  {
    question: 'Como funciona o suporte?',
    answer:
      'Para o template open source: abra issues no GitHub e a comunidade ajuda. Para quem está na FND: acesso à comunidade exclusiva com suporte direto, mentorias ao vivo e canal prioritário para dúvidas técnicas.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-32 bg-muted/30">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            className="text-primary font-medium mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Dúvidas frequentes
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Perguntas <span className="text-primary">respondidas</span>
          </motion.h2>
        </div>

        {/* FAQ Accordion */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground">
            Ainda tem dúvidas?{' '}
            <a
              href="https://brabos.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline"
            >
              Fale com a equipe FND
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
