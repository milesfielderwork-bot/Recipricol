import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-black px-6 py-24">
      <div className="flex w-full max-w-sm flex-col items-center gap-10 text-center">
        <h1 className="text-xl font-extralight uppercase tracking-[0.25em] text-[#f7f3ea]">
          Member Login
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
