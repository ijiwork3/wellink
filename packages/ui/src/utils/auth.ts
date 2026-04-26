const KEY = 'wl_auth'

export const auth = {
  set: (userType: 'brand' | 'influencer') =>
    localStorage.setItem(KEY, userType),
  get: (): 'brand' | 'influencer' | null => {
    const raw = localStorage.getItem(KEY)
    if (raw === 'brand' || raw === 'influencer') return raw
    return null
  },
  clear: () => localStorage.removeItem(KEY),
  isLoggedIn: () => !!localStorage.getItem(KEY),
}
