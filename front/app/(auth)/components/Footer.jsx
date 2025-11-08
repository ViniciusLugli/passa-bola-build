import { Instagram, Twitter, Facebook } from "lucide-react";

const footerLinks = [
  { label: "Sobre", href: "#" },
  { label: "Contato", href: "#" },
  { label: "Privacidade", href: "#" },
  { label: "Termos", href: "#" },
];

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-surface-elevated border-t border-default py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold text-accent mb-2">PassaBola</div>
            <p className="text-secondary text-sm">
              Elevando o futebol feminino no Brasil
            </p>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Links do rodapé">
            <h4 className="text-lg font-semibold text-primary mb-4">
              Navegação
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="
                      py-2
                      inline-block
                      text-secondary
                      hover:text-accent
                      transition-colors
                      focus:outline-none
                      focus:underline
                    "
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold text-primary mb-4">
              Redes Sociais
            </h4>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="
                      w-12
                      h-12
                      min-w-[48px]
                      min-h-[48px]
                      bg-accent-soft
                      rounded-full
                      flex
                      items-center
                      justify-center
                      hover:bg-accent
                      hover:scale-110
                      transition-all
                      duration-200
                      focus:outline-none
                      focus:ring-4
                      focus:ring-accent/50
                    "
                  >
                    <Icon
                      className="w-6 h-6 text-accent hover:text-accent-contrast"
                      aria-hidden="true"
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className="
            border-t
            border-default
            pt-8
            flex
            flex-col
            sm:flex-row
            justify-between
            items-center
            gap-4
            text-sm
            text-tertiary
          "
        >
          <p>
            © {new Date().getFullYear()} PassaBola. Todos os direitos
            reservados.
          </p>
          <p>Uma iniciativa FIAP em parceria com Passa a Bola</p>
        </div>
      </div>
    </footer>
  );
}
