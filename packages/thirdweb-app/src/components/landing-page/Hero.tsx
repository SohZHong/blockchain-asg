import Image from "next/image";

export default function Hero() {
  return (
    <section className="min-h-screen bg-[url('/landing-page/mk-hero-bg.png')] bg-cover bg-center flex items-end pb-16 relative">
      <div className="md:px-28 w-full h-1/2 flex flex-col items-center justify-center">
        <Image
          src="/landing-page/white-title.svg"
          alt="Mystic Kaizer Logo"
          width={980}
          height={168}
          className="absolute bottom-32 left-0 md:block px-16 md:px-0 md:static"
        />
        <div className="flex flex-row items-center justify-center gap-6 w-full mb-12 mb:mb-0">
          <hr className="lg:w-[200px] xl:w-[300px] h-[1.5px] bg-white " />
          <div className="text-sm md:text-3xl xl:text-4xl font-light opacity-80 text-center font-dark-mystic text-white">
            Mystics of the Ancient Order
          </div>
          <hr className="lg:w-[200px] xl:w-[300px] h-[1.5px] bg-white" />
        </div>
      </div>
    </section>
  );
}
