function check(){

let a = document.getElementById("q1").value.trim().toLowerCase();
let b = document.getElementById("q2").value.trim().toLowerCase();

if(a === "13 october 2025" && b === "20 december 2025"){

   let data = JSON.parse(localStorage.getItem("valentineData"));
   data.correctAnswers = {met:a, proposed:b};
   localStorage.setItem("valentineData", JSON.stringify(data));

   window.location.href = "eyes.html";

}else{
   logWrong("quiz", a + " | " + b);
   document.getElementById("result").innerHTML = "Wrong – Try again";
}
}
