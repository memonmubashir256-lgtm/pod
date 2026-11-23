import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { validateNewsletterEmail } from '../utils/valenceLogic';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateNewsletterEmail(email, subscribed);
    if (!res.valid) {
      setErrorMsg(res.error);
      setSuccessMsg(null);
      return;
    }

    setSubscribed((prev) => [...prev, res.normalizedEmail]);
    setErrorMsg(null);
    setSuccessMsg(`Allocation dispatch confirmed for ${res.normalizedEmail}.`);
    setEmail('');
  };

  return (
    <section id="newsletter" className="relative py-20 sm:py-24 bg-[#050505]">
      <div className="mx-auto max-w-[1280px] px-6">
        <div
          className="glass-panel relative overflow-hidden rounded-2xl p-8 sm:p-12"
          style={{
            background:
              'radial-gradient(circle at 85% 20%, rgba(180,76,255,0.16), transparent 50%), radial-gradient(circle at 15% 80%, rgba(81,244,232,0.12), transparent 50%), #0e0e14',
          }}
        >
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="text-xs font-mono tracking-[0.2em] text-[#51F4E8]">
                09 · PRIVATE STUDIO DISPATCH
              </p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white [text-wrap:balance]">
                Reserve Limited PVD Drops
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75">
                Receive priority batch announcements, laboratory pressure notes, and private
                titanium allocation windows.
              </p>
            </div>

            <div className="lg:col-span-6">
              <form onSubmit={handleSubmit} noValidate className="space-y-3">
                <label htmlFor="newsletter-email" className="block text-xs font-medium text-white/80">
                  Studio Email Address
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/45"
                      aria-hidden="true"
                    />
                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="you@studio.com"
                      autoComplete="email"
                      aria-invalid={errorMsg ? 'true' : 'false'}
                      aria-describedby={errorMsg ? 'newsletter-feedback' : undefined}
                      className="h-12 w-full rounded-xl border border-white/15 bg-[#07070b] pl-10 pr-4 text-sm text-white placeholder:text-white/35 focus:border-[#51F4E8] focus:outline-none focus:ring-2 focus:ring-[#51F4E8]/30"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-12 rounded-xl bg-gradient-to-r from-[#426BFF] to-[#B44CFF] px-6 text-sm font-semibold text-white hover:brightness-110 transition cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51F4E8]"
                  >
                    Subscribe
                  </button>
                </div>

                {errorMsg && (
                  <p
                    id="newsletter-feedback"
                    role="alert"
                    className="flex items-center gap-2 text-xs text-rose-400 pt-1"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{errorMsg}</span>
                  </p>
                )}

                {successMsg && (
                  <p
                    role="status"
                    className="flex items-center gap-2 text-xs text-[#51F4E8] pt-1"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{successMsg}</span>
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
