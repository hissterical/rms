import Link from "next/link"
import { motion } from "framer-motion"

export function SiteFooter() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="border-t bg-background"
    >
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 gap-10 md:grid-cols-3"
        >
          <motion.div variants={itemVariants}>
            <motion.h3 
              className="font-bold text-lg bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Sohraa ✨
            </motion.h3>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
              Modern hotel management software designed for independent hotels and groups. Streamline operations and boost revenue.
            </p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-medium text-primary">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link href="#" className="hover:text-primary transition-colors">PMS Core</Link>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link href="#" className="hover:text-primary transition-colors">Booking Engine</Link>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link href="#" className="hover:text-primary transition-colors">Revenue Dashboard</Link>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link href="#" className="hover:text-primary transition-colors">Integrations</Link>
              </motion.li>
            </ul>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-medium text-primary">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link href="#" className="hover:text-primary transition-colors">About</Link>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link href="#" className="hover:text-primary transition-colors">Terms & Conditions</Link>
              </motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link href="#" className="hover:text-primary transition-colors">Contact Us</Link>
              </motion.li>
            </ul>
          </motion.div>
        </motion.div>
        <motion.div 
          variants={itemVariants}
          className="mt-10 border-t pt-6 text-xs text-muted-foreground"
        >
          © {new Date().getFullYear()} Sohraa. All rights reserved.
        </motion.div>
      </div>
    </motion.footer>
  )
}
