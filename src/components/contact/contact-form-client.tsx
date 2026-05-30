"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createBrowserApiClient } from "@/lib/api/client";
import type { ContactMessages } from "@/messages/contact/en";

const api = createBrowserApiClient();

type FormState = "idle" | "submitting" | "success" | "error";

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(
  data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  },
  m: ContactMessages,
): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) errors.name = m.nameRequired;
  else if (data.name.trim().length > 150) errors.name = m.nameTooLong;

  if (!data.email.trim()) errors.email = m.emailRequired;
  else if (!validateEmail(data.email)) errors.email = m.emailInvalid;

  if (!data.subject.trim()) errors.subject = m.subjectRequired;
  else if (data.subject.trim().length > 200) errors.subject = m.subjectTooLong;

  if (!data.message.trim()) errors.message = m.messageRequired;
  else if (data.message.trim().length > 5000) errors.message = m.messageTooLong;

  return errors;
}

interface ContactFormClientProps {
  messages: ContactMessages;
}

export function ContactFormClient({ messages: m }: ContactFormClientProps) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validateForm(formData, m);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setFormState("submitting");
    setErrors({});

    try {
      const { response } = await api.POST("/api/contact", {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        },
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      setFormState("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="flex items-center justify-center size-16 rounded-full bg-green-500/10 mb-6">
          <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
          {m.successTitle}
        </h3>
        <p className="text-muted-foreground mb-8 max-w-sm">
          {m.successMessage}
        </p>
        <Button
          variant="outline"
          onClick={() => setFormState("idle")}
          className="rounded-xl"
        >
          {m.sendAnotherButton}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Name + Email row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">{m.nameFieldLabel}</Label>
          <Input
            id="name"
            name="name"
            placeholder={m.namePlaceholder}
            value={formData.name}
            onChange={handleChange}
            aria-invalid={!!errors.name}
            className={cn(
              "h-11 rounded-xl",
              errors.name && "border-destructive",
            )}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{m.emailFieldLabel}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={m.emailPlaceholder}
            value={formData.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            className={cn(
              "h-11 rounded-xl",
              errors.email && "border-destructive",
            )}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject">{m.subjectFieldLabel}</Label>
        <Input
          id="subject"
          name="subject"
          placeholder={m.subjectPlaceholder}
          value={formData.subject}
          onChange={handleChange}
          aria-invalid={!!errors.subject}
          className={cn(
            "h-11 rounded-xl",
            errors.subject && "border-destructive",
          )}
        />
        {errors.subject && (
          <p className="text-xs text-destructive">{errors.subject}</p>
        )}
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">{m.messageFieldLabel}</Label>
        <Textarea
          id="message"
          name="message"
          placeholder={m.messagePlaceholder}
          rows={5}
          value={formData.message}
          onChange={handleChange}
          aria-invalid={!!errors.message}
          className={cn("rounded-xl", errors.message && "border-destructive")}
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message}</p>
        )}
      </div>

      {/* Error banner */}
      {formState === "error" && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {m.submitError}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        disabled={formState === "submitting"}
        className="group relative w-full sm:w-auto overflow-hidden h-12 px-8 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow duration-300"
      >
        <span className="relative z-10 flex items-center gap-2">
          {formState === "submitting" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {m.submittingButton}
            </>
          ) : (
            <>
              {m.submitButton}
              <Send className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </>
          )}
        </span>
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </Button>
    </form>
  );
}
