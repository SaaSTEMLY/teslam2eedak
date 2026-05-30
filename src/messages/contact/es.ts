import type { ContactMessages } from "./en";

const messages: ContactMessages = {
  // Page metadata
  metaTitle: "Contáctanos",
  metaDescription:
    "Ponte en contacto con el equipo de SaaSTARTER. Nos encantaría saber de ti, ya sea una pregunta, comentario o consulta de asociación.",

  // Page heading
  pageTitle: "Ponte en contacto.",
  pageSubtitle:
    "Ya sea que tengas una pregunta sobre características, precios o cualquier otra cosa, nuestro equipo está listo para responder.",

  // Contact info
  emailLabel: "Correo electrónico",
  emailValue: "hello@saastarter.dev",
  emailDescription: "Nuestro objetivo es responder en 24 horas.",

  locationLabel: "Ubicación",
  locationValue: "San Francisco, CA",
  locationDescription: "Trabajamos remotamente, enviamos globalmente.",

  hoursLabel: "Horario",
  hoursValue: "Lun – Vie, 9am – 6pm PST",
  hoursDescription: "Soporte disponible durante horario laboral.",

  // Additional info
  proPlanNote:
    "Los clientes del plan Pro obtienen soporte prioritario a través de Discord privado. Para preguntas generales, consulta nuestras",
  faqLink: "Preguntas frecuentes",

  // Form section
  formTitle: "Enviar un mensaje",
  formSubtitle: "Completa el formulario y te responderemos pronto.",

  // Form fields
  nameFieldLabel: "Nombre",
  namePlaceholder: "Juan Pérez",
  nameRequired: "El nombre es obligatorio.",
  nameTooLong: "El nombre debe tener 150 caracteres o menos.",

  emailFieldLabel: "Correo electrónico",
  emailPlaceholder: "juan@example.com",
  emailRequired: "El correo electrónico es obligatorio.",
  emailInvalid: "Por favor, introduce una dirección de correo válida.",

  subjectFieldLabel: "Asunto",
  subjectPlaceholder: "¿Cómo podemos ayudarte?",
  subjectRequired: "El asunto es obligatorio.",
  subjectTooLong: "El asunto debe tener 200 caracteres o menos.",

  messageFieldLabel: "Mensaje",
  messagePlaceholder: "Cuéntanos más sobre tu pregunta o proyecto...",
  messageRequired: "El mensaje es obligatorio.",
  messageTooLong: "El mensaje debe tener 5,000 caracteres o menos.",

  // Form states
  submitButton: "Enviar mensaje",
  submittingButton: "Enviando...",
  submitError: "Algo salió mal. Por favor, inténtalo de nuevo.",

  // Success state
  successTitle: "¡Mensaje enviado!",
  successMessage:
    "Gracias por contactarnos. Te responderemos dentro de 24 horas.",
  sendAnotherButton: "Enviar otro mensaje",
};

export default messages;
