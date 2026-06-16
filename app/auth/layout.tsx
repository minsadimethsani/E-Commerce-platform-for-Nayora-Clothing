import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#FAF9F6]">
      {/* Left Pane - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#EAE5DF]">
        <Image
          src="/brand-story.png"
          alt="Nayora Editorial"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-12 left-12">
          <Link href="/" className="text-white font-serif text-3xl font-bold tracking-widest">
            NAYORA.
          </Link>
        </div>
        <div className="absolute bottom-16 left-12 right-12 text-white">
          <p className="font-serif text-4xl leading-snug mb-4">
            "Elegance is not about being noticed, it's about being remembered."
          </p>
          <span className="text-sm uppercase tracking-widest font-semibold opacity-80">
            The Nayora Philosophy
          </span>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">
        <div className="lg:hidden absolute top-8 left-8">
          <Link href="/" className="text-[#2C241E] font-serif text-2xl font-bold tracking-widest">
            NAYORA.
          </Link>
        </div>
        
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
