import Link from "next/link";
import { Phone } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Emergency Banner */}
      <div className="bg-destructive text-destructive-foreground px-4 py-3 text-center text-sm font-medium">
        <Phone className="inline-block h-4 w-4 mr-1" />
        If you are in immediate danger, call{" "}
        <a href="tel:000" className="underline font-bold">
          000
        </a>
        . For 24/7 crisis support, call Lifeline{" "}
        <a href="tel:131114" className="underline font-bold">
          13 11 14
        </a>
      </div>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            MindSupport Victoria
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Free, confidential AI-powered mental health support for Victorian
            adults. Talk through what you&apos;re feeling, learn coping
            strategies, and find local resources.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg border border-border bg-muted/50 p-6 text-left max-w-2xl mx-auto mt-12">
            <h2 className="text-sm font-semibold text-foreground mb-2">
              Important Information
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              MindSupport Victoria is an AI-powered support tool and is{" "}
              <strong>not a substitute</strong> for professional mental health
              care. It does not provide diagnoses, treatment plans, or medical
              advice. If you are experiencing a mental health crisis, please
              contact emergency services or a crisis helpline immediately.
            </p>
          </div>
        </div>
      </main>

      {/* Crisis Resources Footer */}
      <footer className="border-t border-border bg-muted/30 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-sm font-semibold text-foreground mb-4 text-center">
            24/7 Crisis Support
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 rounded-md bg-background border border-border">
              <p className="font-medium text-foreground">Emergency</p>
              <a
                href="tel:000"
                className="text-primary hover:underline font-bold"
              >
                000
              </a>
            </div>
            <div className="text-center p-3 rounded-md bg-background border border-border">
              <p className="font-medium text-foreground">Lifeline</p>
              <a
                href="tel:131114"
                className="text-primary hover:underline font-bold"
              >
                13 11 14
              </a>
            </div>
            <div className="text-center p-3 rounded-md bg-background border border-border">
              <p className="font-medium text-foreground">Beyond Blue</p>
              <a
                href="tel:1300224636"
                className="text-primary hover:underline font-bold"
              >
                1300 22 4636
              </a>
            </div>
            <div className="text-center p-3 rounded-md bg-background border border-border">
              <p className="font-medium text-foreground">VIC Crisis Line</p>
              <a
                href="tel:1300842747"
                className="text-primary hover:underline font-bold"
              >
                1300 842 747
              </a>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6">
            &copy; {new Date().getFullYear()} MindSupport Victoria. For
            Victorian adults aged 18+.
          </p>
        </div>
      </footer>
    </div>
  );
}
