import { motion } from "framer-motion";

const footerSections = [
  {
    title: "Company",
    links: ["About", "Blog", "Jobs", "Press", "Partners"],
  },
  {
    title: "Solutions",
    links: ["Marketing", "Analytics", "Commerce", "Insights", "Support"],
  },
  {
    title: "Documentation",
    links: ["Guides", "API Status"],
  },
  {
    title: "Legal",
    links: ["Claim", "Privacy", "Terms"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-16">
      {/* Top Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">

          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
                {section.title}
              </h3>

              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-white transition-all duration-300 relative group inline-block"
                    >
                      {link}

                      {/* underline animation */}
                      <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800 my-10" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">

          <p>© {new Date().getFullYear()} MyShop. All rights reserved.</p>

          <p>
            Icons by{" "}
            <a
              href="https://www.freepik.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white underline underline-offset-4"
            >
              Freepik
            </a>{" "}
            from{" "}
            <a
              href="https://www.flaticon.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white underline underline-offset-4"
            >
              Flaticon
            </a>
          </p>

          <p className="flex items-center gap-1">
            Made with
            <span className="text-red-500 animate-pulse text-sm">♥</span>
            by Me
          </p>

        </div>
      </div>
    </footer>
  );
}