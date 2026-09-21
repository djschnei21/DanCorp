export const THEME_KEY = "dancorp.theme";

export type ThemeChoice = "light" | "dark";

export function resolveTheme(stored: string | null, systemDark: boolean): ThemeChoice {
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return systemDark ? "dark" : "light";
}

// The click listener lives here, not on the React button. The dev client sometimes
// never hydrates, and a second React handler would toggle twice and look like a no-op.
export const themeBootScript = `(function(){
  var key=${JSON.stringify(THEME_KEY)};
  function stored(){try{return localStorage.getItem(key);}catch(e){return null;}}
  function systemDark(){return window.matchMedia("(prefers-color-scheme: dark)").matches;}
  function resolved(){
    var value=stored();
    if(value==="light"||value==="dark")return value;
    return systemDark()?"dark":"light";
  }
  function apply(){
    var value=stored();
    var theme=resolved();
    var root=document.documentElement;
    root.classList.toggle("dark",value==="dark");
    root.classList.toggle("light",value==="light");
    var btn=document.getElementById("theme-toggle");
    if(btn){
      btn.textContent=theme==="dark"?"Dark":"Light";
      btn.setAttribute("aria-label",theme==="dark"?"Switch to light theme":"Switch to dark theme");
    }
  }
  window.__dancorpToggleTheme=function(){
    var next=resolved()==="dark"?"light":"dark";
    try{localStorage.setItem(key,next);}catch(e){}
    apply();
    document.dispatchEvent(new Event("dancorp-theme"));
  };
  apply();
  if(window.__dancorpThemeBound)return;
  window.__dancorpThemeBound=true;
  document.addEventListener("click",function(event){
    var target=event.target;
    if(target&&target.closest&&target.closest("#theme-toggle"))window.__dancorpToggleTheme();
  });
  var media=window.matchMedia("(prefers-color-scheme: dark)");
  if(media.addEventListener){
    media.addEventListener("change",function(){
      apply();
      document.dispatchEvent(new Event("dancorp-theme"));
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply);
})();`;
