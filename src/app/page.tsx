import Image from "next/image";
import RegisterForm from "./RegisterForm";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black px-6 py-24">
      <Image
        src="/hero-bg.jpg"
        alt=""
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 42%, transparent 55%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-8 text-center">
        <h1 className="text-3xl font-extralight uppercase tracking-[0.12em] text-[#f7f3ea] sm:text-4xl sm:tracking-[0.22em] md:text-[2.75rem] md:tracking-[0.28em]">
          Reciprocal
        </h1>

        <div className="flex flex-col gap-5 text-sm font-light uppercase leading-relaxed tracking-[0.1em] text-[#f2ede4]/85 sm:text-base">
          <p>
            A closed, tight knit, golf community designed to connect
            members of golf clubs with nomadic golfers.
          </p>

          <p>
            Club members get paid to host nomads.
            <br />
            Nomads get the privilege of access.
          </p>

          <p>
            Every single member of the community is vetted, ensuring
            that the connections made on the golf course are ones
            worth making.
          </p>

          <p>
            We&apos;re currently recruiting member interest now,
            register now to mark your intent.
          </p>
        </div>

        <RegisterForm />
      </div>
    </main>
  );
}
