/**
 * Formata uma data para o timezone de São Paulo (America/Sao_Paulo)
 * @param {string|Date} date - Data a ser formatada
 * @returns {Object} Objeto com data e hora formatadas
 */
export function formatDateTimeBrazil(date) {
  const dateObj = new Date(date);

  const formattedDate = dateObj.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formattedTime = dateObj.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return {
    date: formattedDate,
    time: formattedTime,
    fullDateTime: `${formattedDate} - ${formattedTime}`,
  };
}

/**
 * Formata apenas a data para o timezone de São Paulo
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada
 */
export function formatDateBrazil(date) {
  const dateObj = new Date(date);

  return dateObj.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formata apenas a hora para o timezone de São Paulo
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Hora formatada
 */
export function formatTimeBrazil(date) {
  const dateObj = new Date(date);

  return dateObj.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
