const switches = [
  { name: "Gateron Oil King", brand: "Gateron", type: "linear", force: 55, color: "#303735", tone: 105 },
  { name: "Cherry MX Red", brand: "Cherry", type: "linear", force: 45, color: "#cf493f", tone: 125 },
  { name: "Kailh Box Jade", brand: "Kailh", type: "clicky", force: 50, color: "#67b9ab", tone: 240 },
  { name: "Holy Panda X", brand: "Drop", type: "tactile", force: 60, color: "#e6d8b7", tone: 155 },
  { name: "Boba U4T", brand: "Gazzew", type: "tactile", force: 62, color: "#d8c6ab", tone: 135 },
  { name: "Akko Cream Yellow", brand: "Akko", type: "linear", force: 50, color: "#f0d263", tone: 115 },
  { name: "Cherry MX Blue", brand: "Cherry", type: "clicky", force: 60, color: "#4a80ac", tone: 260 },
  { name: "Gateron Milky Yellow", brand: "Gateron", type: "linear", force: 50, color: "#e8c967", tone: 110 },
  { name: "Durock T1", brand: "Durock", type: "tactile", force: 67, color: "#608d76", tone: 145 },
  { name: "Kailh Box White", brand: "Kailh", type: "clicky", force: 45, color: "#eeece4", tone: 285 },
  { name: "Glorious Panda", brand: "Glorious", type: "tactile", force: 67, color: "#d9b788", tone: 150 },
  { name: "Tangerine 67g", brand: "C³Equalz", type: "linear", force: 67, color: "#e98538", tone: 98 }
];
const rows = [["ESC","1","2","3","4","5","6","7","8","9","0","−","=","BACK","DEL"],["TAB","Q","W","E","R","T","Y","U","I","O","P","[","]","\\"],["CAPS","A","S","D","F","G","H","J","K","L",";","'","ENTER"],["SHIFT","Z","X","C","V","B","N","M",",",".","/","SHIFT","↑"],["CTRL","FN","ALT","SPACE","ALT","←","↓","→"]];
let selected = 0, muted = false, audioContext, toastTimer;
const keyboard = document.querySelector("#virtual-keyboard"), grid = document.querySelector("#switch-grid");

rows.flat().forEach((label) => { const key=document.createElement("button"); key.className="key"; if(["BACK","TAB","CAPS","ENTER","SHIFT"].includes(label)) key.classList.add("wide"); if(label==="SPACE") key.classList.add("space"); key.textContent=label; key.dataset.key=label; key.addEventListener("pointerdown",()=>pressKey(key)); keyboard.appendChild(key); });

function createNoise(ctx, duration=.06){const buffer=ctx.createBuffer(1,ctx.sampleRate*duration,ctx.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,3);const source=ctx.createBufferSource();source.buffer=buffer;return source}
function playSwitch(){if(muted)return; audioContext ||= new (window.AudioContext||window.webkitAudioContext)(); const ctx=audioContext,s=switches[selected],now=ctx.currentTime,volume=Number(document.querySelector("#volume").value)/100; const gain=ctx.createGain(),filter=ctx.createBiquadFilter(); filter.type="lowpass";const profile=document.querySelector("#case-profile").value;filter.frequency.value=profile==="plastic"?1800:profile==="wood"?1200:2500;gain.gain.setValueAtTime(volume*.38,now);gain.gain.exponentialRampToValueAtTime(.001,now+.12);filter.connect(gain).connect(ctx.destination);const noise=createNoise(ctx,s.type==="clicky"?.09:.07);noise.connect(filter);noise.start(now);if(s.type!=="linear"){const osc=ctx.createOscillator(),og=ctx.createGain();osc.type="triangle";osc.frequency.setValueAtTime(s.tone*4,now);og.gain.setValueAtTime(volume*(s.type==="clicky"?.16:.08),now);og.gain.exponentialRampToValueAtTime(.001,now+.045);osc.connect(og).connect(ctx.destination);osc.start(now);osc.stop(now+.05)}if(document.querySelector("#room-tone").checked){gain.gain.setTargetAtTime(.001,now+.05,.05)}}
function pressKey(key){key.classList.add("pressed");playSwitch();setTimeout(()=>key.classList.remove("pressed"),105)}
document.addEventListener("keydown",(event)=>{if(event.repeat||["INPUT","SELECT"].includes(event.target.tagName))return;event.preventDefault();const value=event.code==="Space"?"SPACE":event.key.toUpperCase();const key=[...document.querySelectorAll(".key")].find(k=>k.dataset.key===value)||document.querySelector(".key");pressKey(key)});

function renderCards(filter="all"){grid.innerHTML="";switches.forEach((item,index)=>{if(filter!=="all"&&item.type!==filter)return;const card=document.createElement("article");card.className=`switch-card ${index===selected?"selected":""}`;card.style.setProperty("--switch-color",item.color);card.innerHTML=`<div class="switch-top"><div class="switch-visual"></div><button class="play-button" aria-label="Test ${item.name}">▶</button></div><h3>${item.name}</h3><div class="switch-meta"><span>${item.brand} · ${item.type}</span><span>${item.force}g</span></div>`;card.addEventListener("click",()=>selectSwitch(index,true));grid.appendChild(card)})}
function selectSwitch(index,play=false){selected=index;const item=switches[index];document.querySelector("#selected-name").textContent=item.name;document.querySelector("#selected-swatch").style.background=item.color;renderCards(document.querySelector(".filter.active").dataset.filter);if(play)playSwitch();showToast(`${item.name} loaded`)}
function showToast(message){const toast=document.querySelector("#toast");toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),1600)}
document.querySelectorAll(".filter").forEach(button=>button.addEventListener("click",()=>{document.querySelector(".filter.active").classList.remove("active");button.classList.add("active");renderCards(button.dataset.filter)}));
document.querySelector("#next-switch").addEventListener("click",()=>selectSwitch((selected+1)%switches.length,true));
document.querySelector("#sound-toggle").addEventListener("click",event=>{muted=!muted;event.currentTarget.setAttribute("aria-pressed",muted);event.currentTarget.querySelector("span").textContent=muted?"◖×":"◖))";showToast(muted?"Sounds muted":"Sounds on")});
renderCards();selectSwitch(0);
