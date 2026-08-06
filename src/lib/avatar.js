export function getAvatarUrl(email) {
  if (!email) return 'https://i.pravatar.cc/128?u=demo'
  try {
    const custom = localStorage.getItem(`medvault_avatar_${email}`)
    if (custom) return custom
  } catch {}
  return `https://i.pravatar.cc/128?u=${email}`
}

export function setAvatarUrl(email, dataUrl) {
  try {
    localStorage.setItem(`medvault_avatar_${email}`, dataUrl)
  } catch {}
}