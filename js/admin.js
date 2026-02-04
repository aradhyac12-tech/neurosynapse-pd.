function load(){

 let data = JSON.parse(localStorage.getItem("valentineData"));

 let html = `
 <p>Opened: ${data.openTime}</p>
 <p>Total Attempts: ${data.totalAttempts}</p>
 <p>Love Response: ${data.loveResponse}</p>
 <h3>Wrong Attempts</h3>
 `;

 data.wrongAttempts.forEach(w=>{
    html += `<p>${w.page} - ${w.value} - ${w.time}</p>`;
 });

 document.getElementById("data").innerHTML = html;
}

function reset(){
  localStorage.clear();
  alert("Cleared");
}

window.onload = load;
