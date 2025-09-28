export const TOKEN_KEY_PERSIST = 'auth_token'
export const TOKEN_KEY_SESSION = 'auth_token_session'

export function setToken(token: string, remember: boolean) {
  try {
    if (remember) {
      localStorage.setItem(TOKEN_KEY_PERSIST, token)
      sessionStorage.removeItem(TOKEN_KEY_SESSION)
    } else {
      sessionStorage.setItem(TOKEN_KEY_SESSION, token)
      localStorage.removeItem(TOKEN_KEY_PERSIST)
    }
  } catch {}
}

export function getToken(): string | null {
  try {
    const session = sessionStorage.getItem(TOKEN_KEY_SESSION)
    if (session) return session
    const persistent = localStorage.getItem(TOKEN_KEY_PERSIST)
    return persistent
  } catch {
    return null
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY_PERSIST)
  } catch {}
  try {
    sessionStorage.removeItem(TOKEN_KEY_SESSION)
  } catch {}
}
