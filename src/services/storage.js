// La sesión del usuario autenticado vive en el navegador; el resto de los datos están en Supabase.
const SESSION_KEY = 'proshine_session';

function readSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function writeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export { readSession, writeSession, clearSession };
