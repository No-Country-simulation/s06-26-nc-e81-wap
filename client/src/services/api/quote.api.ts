const quotes = [
  "El código es como el humor. Cuando tienes que explicarlo, es malo.",
  "Primero resuelve el problema, luego escribe el código.",
  "La experiencia es el nombre que todos le dan a sus errores.",
  "No es un bug, es una característica no documentada.",
  "Programar: el arte de hacerle entender a una máquina lo que quieres.",
  "La constancia vence lo que el talento no alcanza.",
  "El mejor momento para empezar fue ayer. El segundo mejor es ahora.",
  "No se trata de tener tiempo, se trata de tener disciplina.",
  "Los grandes logros necesitan tiempo.",
  "Tu única competencia es tu versión de ayer.",
  "El esfuerzo de hoy es el éxito de mañana.",
  "Aprender a programar es aprender a pensar.",
  "Cada línea que escribes te acerca más a tu meta.",
  "No te rindas. Los principios siempre son lo más difícil.",
  "Pequeños progresos cada día llevan a grandes resultados.",
  "La mejor forma de predecir el futuro es crearlo.",
  "El conocimiento es el único tesoro que aumenta cuando lo compartes.",
  "No cuentes los días, haz que los días cuenten.",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "Cree en ti y en tu capacidad de aprender.",
];

function getTodayIndex(): number {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % quotes.length;
}

export async function getDailyQuote(): Promise<string> {
  return Promise.resolve(quotes[getTodayIndex()]);
}
