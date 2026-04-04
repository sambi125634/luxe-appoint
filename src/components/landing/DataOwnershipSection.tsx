import { motion } from "framer-motion";

export const DataOwnershipSection = () => {
  return (
    <section className="py-24 md:py-32 bg-black text-white">
      <div className="container max-w-3xl mx-auto px-4">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-xl md:text-2xl font-serif leading-relaxed">
            Jeśli korzystasz z platformy marketplace —
            <br />
            masz dostęp do <em>ich</em> klientek.
            <br />
            <strong>Nie do swoich.</strong>
          </p>

          <p className="text-lg md:text-xl text-white/70 leading-relaxed">
            Jutro mogą podnieść prowizję.
            <br />
            Pojutrze mogą wyświetlić Twoją konkurencję
            <br />
            tej samej klientce za 10 zł taniej.
          </p>

          <p className="text-xl md:text-2xl font-serif font-bold">
            A Ty nie możesz nic zrobić.
            <br />
            Bo to ich baza. <span className="text-white/50">Nie Twoja.</span>
          </p>
        </motion.div>

        <div className="my-12 md:my-16 border-t border-white/20 max-w-xs mx-auto" />

        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <p className="text-xl md:text-2xl font-serif leading-relaxed">
            <span className="text-primary font-bold">Beauty Calendar</span> buduje{" "}
            <span className="text-primary">Twoją</span> bazę.
            <br />
            Każda klientka. Każda wizyta. Każdy kontakt.
            <br />
            <strong className="text-primary">Twoje dane. Na zawsze.</strong>
            <br />
            Niezależnie od jakiejkolwiek platformy.
          </p>

          <p className="text-sm text-white/40">
            Eksportujesz kiedy chcesz. Zabierasz gdzie chcesz.
            <br />
            Nikt Ci tego nie odbierze.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
