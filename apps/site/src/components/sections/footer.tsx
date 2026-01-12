import { Github, Linkedin, Youtube } from 'lucide-react';

const links = {
  template: [
    { label: 'Features', href: '#features' },
    { label: 'Como Funciona', href: '#how-it-works' },
    { label: 'FND Pro', href: '#fnd-pro' },
    { label: 'Preços', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  recursos: [
    { label: 'GitHub', href: 'https://github.com/xmaiconx/fnd-quick-launch' },
    { label: 'Documentação', href: 'https://github.com/xmaiconx/fnd-quick-launch#readme' },
    { label: 'Licença MIT', href: 'https://github.com/xmaiconx/fnd-quick-launch/blob/main/LICENSE' },
  ],
  fnd: [
    { label: 'Sobre a FND', href: 'https://brabos.ai' },
    { label: 'FND Pro', href: 'https://brabos.ai/fnd-pro' },
  ],
};

const socials = [
  { icon: Github, href: 'https://github.com/xmaiconx', label: 'GitHub' },
  { icon: Youtube, href: 'https://youtube.com/@maiconmatsubara', label: 'YouTube' },
  { icon: Linkedin, href: 'https://linkedin.com/in/maiconmatsubara', label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container px-4 py-12 md:py-16">
        {/* Main footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-sm">QL</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">QuickLaunch</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Template open source para lançar seu SaaS em semanas.
              100% gratuito, licença MIT.
            </p>
            <div className="flex gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-orange-500 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Template</h4>
            <ul className="space-y-3">
              {links.template.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-3">
              {links.recursos.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">FND</h4>
            <ul className="space-y-3">
              {links.fnd.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} QuickLaunch Template. Licença MIT.
          </p>
          <p className="text-sm text-muted-foreground">
            Criado por{' '}
            <a
              href="https://linkedin.com/in/maiconmatsubara"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Maicon Matsubara
            </a>
            {' '}· Parte do ecossistema{' '}
            <a
              href="https://brabos.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline"
            >
              FND
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
