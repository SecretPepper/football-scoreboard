(() => {
"use strict";
const params=new URLSearchParams(location.search);
const room=(params.get("room")||"topball-scoreboard").replace(/[^a-zA-Z0-9_-]/g,"").slice(0,40)||"topball-scoreboard";
const peer=new Peer("scoreboard-"+room+"-display",{debug:0});
let state={homeName:"FUL",awayName:"MUN",homeLogo:"assets/fulham.png",awayLogo:"assets/manchester-united.png",homeScore:0,awayScore:0,elapsedMs:0,running:false,startedAt:null};

function elapsed(){return state.running&&state.startedAt?state.elapsedMs+(Date.now()-state.startedAt):state.elapsedMs}
function render(){
 document.getElementById("homeName").textContent=state.homeName||"HOME";
 document.getElementById("awayName").textContent=state.awayName||"AWAY";
 document.getElementById("homeScore").textContent=state.homeScore??0;
 document.getElementById("awayScore").textContent=state.awayScore??0;
 document.getElementById("homeLogo").src=state.homeLogo||"";
 document.getElementById("awayLogo").src=state.awayLogo||"";
 const t=Math.max(0,Math.floor(elapsed()/1000)); document.getElementById("timer").textContent=String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0");
}
function broadcast(data){state={...state,...data};render();data.startedAt=state.startedAt;data.elapsedMs=state.elapsedMs; if(conn&&conn.open) conn.send({type:"state",state})}
let conn=null;
peer.on("open",()=>{render(); peer.on("connection",c=>{conn=c;c.on("open",()=>c.send({type:"state",state}));c.on("data",m=>{if(m&&m.type==="state"){state={...state,...m.state};render()}})})});
peer.on("error",()=>{});
setInterval(render,250);
render();
})();