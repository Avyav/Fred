import Link from "next/link";
import Image from "next/image";
import { Phone, Shield, MapPin, Clock } from "lucide-react";

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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 gradient-lilac-hero">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="opacity-0 animate-fade-in-up flex flex-col items-center gap-4">
            <Image
              src="/images/FRED.svg"
              alt="FRED"
              width={320}
              height={110}
              className="mx-auto rounded-2xl"
              priority
            />
          </div>
          <p className="text-lg text-muted-foreground -mt-4 opacity-0 animate-fade-in-up-delay-1">
            Mental Health Support Victoria
          </p>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in-up-delay-2">
            Free, confidential AI-powered mental health support for Victorian
            adults. Talk through what you&apos;re feeling, learn coping
            strategies, and find local resources.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 opacity-0 animate-fade-in-up-delay-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all"
            >
              Get Started
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center rounded-xl border border-input bg-background/80 backdrop-blur-sm px-8 py-3.5 text-base font-medium text-foreground shadow-sm hover:bg-background hover:-translate-y-0.5 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="max-w-4xl mx-auto mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full opacity-0 animate-fade-in-up-delay-4">
          <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-purple-100 p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5">Confidential Support</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your conversations are private and encrypted. No data is shared without your consent.
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-purple-100 p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5">Victorian Resources</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connected to local mental health services, GPs, and community support across Victoria.
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-purple-100 p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5">Available 24/7</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Get support whenever you need it, day or night. No appointments or waitlists.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-2xl border border-purple-100 bg-white/60 backdrop-blur-sm p-6 text-left max-w-2xl mx-auto mt-16 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-2">
            Important Information
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            FRED is an AI-powered support tool and is{" "}
            <strong>not a substitute</strong> for professional mental health
            care. It does not provide diagnoses, treatment plans, or medical
            advice. If you are experiencing a mental health crisis, please
            contact emergency services or a crisis helpline immediately.
          </p>
        </div>
      </main>

      {/* Crisis Resources Footer */}
      <footer className="border-t border-purple-100 bg-purple-50/30 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-sm font-semibold text-foreground mb-4 text-center">
            24/7 Crisis Support
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 rounded-xl bg-white/80 border border-purple-100 shadow-sm">
              <p className="font-medium text-foreground">Emergency</p>
              <a
                href="tel:000"
                className="text-primary hover:underline font-bold"
              >
                000
              </a>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/80 border border-purple-100 shadow-sm">
              <p className="font-medium text-foreground">Lifeline</p>
              <a
                href="tel:131114"
                className="text-primary hover:underline font-bold"
              >
                13 11 14
              </a>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/80 border border-purple-100 shadow-sm">
              <p className="font-medium text-foreground">Beyond Blue</p>
              <a
                href="tel:1300224636"
                className="text-primary hover:underline font-bold"
              >
                1300 22 4636
              </a>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/80 border border-purple-100 shadow-sm">
              <p className="font-medium text-foreground">VIC Crisis Line</p>
              <a
                href="tel:1300842747"
                className="text-primary hover:underline font-bold"
              >
                1300 842 747
              </a>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6 flex items-center justify-center gap-1.5">
            &copy; {new Date().getFullYear()}
            <Image
              src="/images/Logo1.png"
              alt=""
              width={16}
              height={16}
              className="inline-block"
            />
            FRED - Mental Health Support Victoria. For
            Victorian adults aged 18+.
          </p>
        </div>
      </footer>
    </div>
  );
}
