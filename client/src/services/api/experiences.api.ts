import type { ExperiencesData } from "@/features/experiences/types/experiences.types";

const MOCK_EXPERIENCES: ExperiencesData = {
  featured: {
    id: 1,
    title: "De QA a Engineering Manager en 4 años",
    description:
      "María comparte cómo pasó de ser tester manual a liderar equipos de ingeniería en una de las fintechs más grandes de LATAM. Una historia de resiliencia, aprendizaje constante y networking estratégico.",
    youtubeId: "K4xNBto3As8",
    speakerName: "María Gutiérrez",
    speakerRole: "Engineering Manager • Nubank",
    speakerImage:
      "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/e40b6ea6361a1abe28f32e7910f63b66/1-intro-photo-final.jpg",
    tags: ["liderazgo", "mujeres-en-tech", "latam"],
    duration: "28:15",
    featured: true,
  },
  videos: [
    {
      id: 2,
      title: "Mi primer trabajo en tech sin título universitario",
      description:
        "Carlos dejó la carrera a los 20 años y hoy es Senior Engineer en Google. Cómo construyó su portafolio y encontró mentores que creyeron en él.",
      youtubeId: "9Gf_HrNkmwY",
      speakerName: "Carlos Mendoza",
      speakerRole: "Senior Engineer • Google",
      speakerImage:
        "https://cdn.prod.website-files.com/632a406bba53c60f9ca58a26/65cff24e18a33e51eda1fc67_Blog%20-%20Fotografi%CC%81a%20de%20marca%20personal%20para%20tu%20sitio%20web%20y%20material%20promocional_TT.jpg",
      tags: ["cambio-de-carrera", "emprendimiento"],
      duration: "34:42",
    },
    {
      id: 3,
      title: "Mujeres en tech: cómo romper el ciclo de exclusión",
      description:
        "Tres líderes latinoamericanas conversan sobre imposter syndrome, redes de apoyo y cómo crear espacios más inclusivos en la industria.",
      youtubeId: "lBJepZK5Nqc",
      speakerName: "Panel • Women in Tech LATAM",
      speakerRole: "Mesa redonda",
      speakerImage: "",
      tags: ["mujeres-en-tech", "liderazgo", "latam"],
      duration: "52:10",
    },
    {
      id: 4,
      title: "Quebro fue taxista pero nunca desistio",
      description:
        "Andrés cuenta cómo un bootcamp de 6 meses lo preparó para entrar a una big tech. Consejos prácticos sobre qué estudiar y cómo preparar entrevistas.",
      youtubeId: "rbuybtZcPnI",
      speakerName: "Andrés Rivera",
      speakerRole: "Backend Engineer • Spotify",
      speakerImage:
        "https://media.licdn.com/dms/image/v2/D4E03AQE8Tb2Q5cNuRA/profile-displayphoto-shrink_400_400/B4EZW6L2JMGYAg-/0/1742585423042",
      tags: ["cambio-de-carrera", "emprendimiento"],
      duration: "22:30",
    },
    {
      id: 5,
      title: "Liderazgo en startups: errores que aprendí siendo CTO",
      description:
        "Pedro, CTO fundador de una startup adquirida por Stripe, comparte los errores más costosos que cometió y cómo hubiera evitado cada uno.",
      youtubeId: "9JspXb85fTA",
      speakerName: "Pedro Ramírez",
      speakerRole: "Ex-CTO • Acquired by Stripe",
      speakerImage:
        "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/e40b6ea6361a1abe28f32e7910f63b66/1-intro-photo-final.jpg",
      tags: ["liderazgo", "emprendimiento"],
      duration: "41:05",
    },
    {
      id: 6,
      title: "Cómo construí una red de contactos desde cero",
      description:
        "Ana pasó de no conocer a nadie en tech a tener una red de más de 500 profesionales. Estrategias para hacer networking siendo introvertido.",
      youtubeId: "Q5ZjkKVRbcw",
      speakerName: "Ana López",
      speakerRole: "Developer Advocate • AWS",
      speakerImage:
        "https://cdn.prod.website-files.com/632a406bba53c60f9ca58a26/63c6cce74a196cc7d68e3bc5_1x1_Banner%20Ideas%20para%20tu%20fotografi%CC%81a%20de%20retrato%20ejecutivo%20y%20perfil%20de%20Linkedin.jpg",
      tags: ["cambio-de-carrera", "liderazgo", "latam"],
      duration: "19:48",
    },
  ],
  events: [
    {
      id: 1,
      title: "Seminario: Cómo preparar tu portafolio para FAANG",
      description:
        "Expertos en reclutamiento de FAANG compartirán qué buscan realmente en un portafolio y cómo destacar tu perfil.",
      date: "2026-07-15",
      time: "18:00 GMT-3",
      speakerName: "Laura Castro",
      speakerRole: "Tech Recruiter • Meta",
      registrationLink: "#",
      isUpcoming: true,
      attendeeCount: 128,
    },
    {
      id: 2,
      title: "Charla: Mujeres en ciberseguridad",
      description:
        "Conversación con profesionales latinoamericanas que están redefiniendo el panorama de la seguridad informática.",
      date: "2026-07-22",
      time: "17:00 GMT-3",
      speakerName: "Valeria Ortiz",
      speakerRole: "Security Engineer • Cloudflare",
      registrationLink: "#",
      isUpcoming: true,
      attendeeCount: 67,
    },
    {
      id: 3,
      title: "Workshop: De empleado a emprendedor tech",
      description:
        "Sesión práctica sobre cómo validar tu idea, encontrar co-founders y lanzar tu primer producto digital.",
      date: "2026-06-10",
      time: "15:00 GMT-3",
      speakerName: "Felipe Torres",
      speakerRole: "Founder • Kickstart LATAM",
      registrationLink: "#",
      isUpcoming: false,
    },
  ],
};

export async function getExperiencesData(): Promise<ExperiencesData> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(MOCK_EXPERIENCES), 1500),
  );
}
