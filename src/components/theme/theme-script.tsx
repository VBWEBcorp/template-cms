/** Applique le thème sombre avant le premier affichage (évite un flash clair). */
export function ThemeScript() {
  const script = `(function(){try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}})();`
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
