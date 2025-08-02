export const readQuickLink = (url: string) => {
  const params = new URLSearchParams(url);
  const encoded = params.get("schedule");
  if (!encoded) {
    return null;
  } else {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return JSON.parse(decoded);
  }
};
