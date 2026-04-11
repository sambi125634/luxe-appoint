import { useTranslation } from "react-i18next";

export const TopBanner = () => {
  const { t } = useTranslation();

  const scrollToCalculator = () => {
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-black text-white py-2 md:py-2.5 text-center">
      <p className="text-xs md:text-sm px-4">
        {t("landing.topBanner.text")}{" "}
        <span className="font-bold">{t("landing.topBanner.amount")}</span> {t("landing.topBanner.suffix")}{" "}
        <button
          onClick={scrollToCalculator}
          className="text-primary underline underline-offset-2 font-semibold hover:text-primary/80 transition-colors"
        >
          {t("landing.topBanner.cta")}
        </button>
      </p>
    </div>
  );
};
