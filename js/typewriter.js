let text = `
na dur na karib hai tu  
par mere dil ke pass hai tu  
kabhi ruthna to kabhi manana hai  
kabhi pyar to kabhi gussa hai  
chod ye bato ko tu  
muze toh tuze chahna hai  
bate band mat kara kr muzse  
tere pyar mai he to fida hai hum  

wrote by - aradhya
`;

let i = 0;

function type(){
  if(i < text.length){
    document.getElementById("poem").innerHTML += text.charAt(i);
    i++;
    setTimeout(type,60);
  }else{
    setTimeout(()=>{
       window.location.href="love-test.html";
    },3000);
  }
}

window.onload = type;
