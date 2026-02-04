let bpm = 72;

function increase(){
   if(bpm < 120){
     bpm += 4;
     document.getElementById("beat").innerHTML = bpm;
     document.getElementById("humanHeart").style.transform =
        "scale(" + (1 + bpm/200) + ")";
   }
}

document.getElementById("eyesPic")
.addEventListener("mouseover", function(){
    let interval = setInterval(increase, 400);
    setTimeout(()=> clearInterval(interval), 5000);
});

function next(){
  window.location.href = "heart-visual.html";
}
