function yes(){
   let data = JSON.parse(localStorage.getItem("valentineData"));
   data.loveResponse = "YES";
   localStorage.setItem("valentineData", JSON.stringify(data));
   alert("I knew it");
}

function no(){
   logWrong("love-test","NO");
   alert("Think again");
}
