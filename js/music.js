function startMusic(){
   if(localStorage.getItem("music") === "start"){

      if(!document.getElementById("bgSong")){
         let audio = document.createElement("audio");
         audio.id = "bgSong";
         audio.src = "../assets/song.mp3";
         audio.loop = true;
         audio.autoplay = true;
         document.body.appendChild(audio);
         audio.play();
      }
   }
}
window.onload = startMusic;
