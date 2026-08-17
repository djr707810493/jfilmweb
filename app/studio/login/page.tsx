import { LoginForm } from "@/components/auth/login-form";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Client Login",
  description:
    "Sign in to your J FILM STUDIO client portal — view inquiries, galleries, and account details.",
  path: "/studio/login",
  noIndex: true,
});

export default function StudioLoginPage() {
  return (
    <section className="container-editorial py-16 md:py-24 lg:py-28">
      <div className="mx-auto max-w-lg">
        <p className="label-editorial text-center">Client Portal</p>
        <h1 className="font-display mt-3 text-center text-3xl text-soft-black md:text-4xl">
          Welcome
        </h1>
        <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-soft-black-muted">
          Sign in with Google or email to access your gallery, inquiry status,
          and messages from the studio.
        </p>
        <div className="mt-10 border border-taupe/40 bg-ivory-dark p-6 md:p-10">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          Secure client access · J FILM STUDIO
        </p>
      </div>
    </section>
  );
}
