function checkDevice(){
   let session = localStorage.getItem("session");

   if(session === "admin") return;

   if(screen.width < CONFIG.targetWidth){
      document.body.innerHTML =
      "<h2 style='color:white;text-align:center;margin-top:20%'>Open on Laptop 1920x1080 only</h2>";
   }
}

window.onload = checkDevice;
