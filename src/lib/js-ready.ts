export const JS_READY =
  "var d=document.documentElement;d.classList.add('js-ready');setTimeout(function(){if(!d.classList.contains('fx'))d.classList.remove('js-ready')},3000);";
