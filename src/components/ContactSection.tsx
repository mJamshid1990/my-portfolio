import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Mail, MapPin, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { validateContactInput } from '../utils/validation';

export function ContactSection() {
  const { t } = useLanguage();
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setServerError('');

    const validation = validateContactInput({
      senderName,
      senderEmail,
      subject,
      body,
    });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderName, senderEmail, subject, body }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setStatus('error');
        setServerError(data.error || t.contact.form.error);
        return;
      }

      setStatus('success');
      setSenderName('');
      setSenderEmail('');
      setSubject('');
      setBody('');
    } catch {
      setStatus('error');
      setServerError(t.contact.form.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-white dark:bg-zinc-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-zinc-100 tracking-tight">
                {t.contact.sectionTitle}
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t.contact.sectionSubtitle}
              </p>
            </div>

            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-5">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t.contact.directTitle}
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{t.contact.emailLabel}</div>
                    <a
                      href="mailto:jamshid.mahmudov29091990@gmail.com"
                      className="font-medium text-zinc-950 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 break-all"
                    >
                      jamshid.mahmudov29091990@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{t.contact.locationLabel}</div>
                    <div className="font-medium text-zinc-950 dark:text-zinc-100">
                      {t.contact.locationValue}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-6 text-xs font-medium">
                  <a
                    href="https://github.com/jamshid-dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4"
                  >
                    {t.contact.githubLabel}
                  </a>
                  <a
                    href="https://t.me/jamshid_dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4"
                  >
                    {t.contact.telegramLabel}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Validated Contact Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#FAFAFA] dark:bg-zinc-900 p-6 sm:p-8 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {t.contact.form.name}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder={t.contact.form.namePlaceholder}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600"
                  />
                  {errors.senderName ? (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.senderName}</span>
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    {t.contact.form.email}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder={t.contact.form.emailPlaceholder}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600"
                  />
                  {errors.senderEmail ? (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.senderEmail}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {t.contact.form.subject}
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t.contact.form.subjectPlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600"
                />
                {errors.subject ? (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.subject}</span>
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-body"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {t.contact.form.body}
                </label>
                <textarea
                  id="contact-body"
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={t.contact.form.bodyPlaceholder}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 resize-y"
                />
                {errors.body ? (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.body}</span>
                  </p>
                ) : null}
              </div>

              {status === 'success' ? (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-3 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{t.contact.form.success}</span>
                </div>
              ) : null}

              {status === 'error' ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/60 px-4 py-3 text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serverError || t.contact.form.error}</span>
                </div>
              ) : null}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {submitting
                      ? t.contact.form.submitting
                      : t.contact.form.submit}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
