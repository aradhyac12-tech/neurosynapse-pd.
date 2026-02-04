function initData(){
   if(!localStorage.getItem("valentineData")){
      let data = {
         openTime: new Date().toLocaleString(),
         totalAttempts: 0,
         wrongAttempts: [],
         correctAnswers: {},
         loveResponse: ""
      };
      localStorage.setItem("valentineData", JSON.stringify(data));
   }
}

function logWrong(page, value){
   let data = JSON.parse(localStorage.getItem("valentineData"));
   data.totalAttempts += 1;
   data.wrongAttempts.push({
       page: page,
       value: value,
       time: new Date().toLocaleString()
   });
   localStorage.setItem("valentineData", JSON.stringify(data));
}

function login(){
   initData();

   let pass = document.getElementById("password").value;

   if(pass === CONFIG.password){
        localStorage.setItem("session","user");
        localStorage.setItem("music","start");
        window.location.href = "pages/quiz.html";
   }
   else if(pass === CONFIG.adminPassword){
        localStorage.setItem("session","admin");
        window.location.href = "admin.html";
   }
   else{
        logWrong("login", pass);
        document.getElementById("error").innerHTML = "Wrong Password";
   }
}
