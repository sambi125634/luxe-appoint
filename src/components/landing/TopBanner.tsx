export const TopBanner = () => {
  const scrollToCalculator = () => {
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-black text-white py-2.5 text-center">
      <p className="text-xs md:text-sm px-4">
        Przeciętna właścicielka salonu traci{" "}
        <span className="font-bold">38 000 zł rocznie</span> na klientkach które nie wróciły. Ile Ty tracisz?{" "}
        <button
          onClick={scrollToCalculator}
          className="text-primary underline underline-offset-2 font-semibold hover:text-primary/80 transition-colors"
        >
          Sprawdź →
        </button>
      </p>
    </div>
  );
};