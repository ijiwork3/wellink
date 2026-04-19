const KEY = 'wl_auth'

export const auth = {
  set: (userType: 'brand' | 'influencer') =>
    sessionStorage.setItem(KEY, userType),
  get: (): 'brand' | 'influencer' | null => {
    const raw = sessionStorage.getItem(KEY)
    if (raw === 'brand' || raw === 'influencer') return raw
    return null
  },
  clear: () => sessionStorage.removeItem(KEY),
  isLoggedIn: () => !!sessionStorage.getItem(KEY),
}
