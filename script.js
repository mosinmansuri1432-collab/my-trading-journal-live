/*=========================================================
DISCIPLINE ADVANCED TRADER JOURNAL V2
script.js
Part 1
=========================================================*/

"use strict";

/*=========================================================
DATABASE
=========================================================*/

let journal = JSON.parse(localStorage.getItem("TradingJournalV2")) || {};

let currentDate = "";

/*=========================================================
ELEMENTS
=========================================================*/

const journalDate = document.getElementById("journalDate");

const session = document.getElementById("session");

const marketBias = document.getElementById("marketBias");

const tradeBody = document.getElementById("tradeBody");

const addTrade = document.getElementById("addTrade");

const saveTrade = document.getElementById("saveTrade");

/*=========================================================
TODAY
=========================================================*/

const today = new Date();

const yyyy = today.getFullYear();

const mm = String(today.getMonth()+1).padStart(2,"0");

const dd = String(today.getDate()).padStart(2,"0");

currentDate = `${yyyy}-${mm}-${dd}`;

journalDate.value = currentDate;

/*=========================================================
CREATE DATE
=========================================================*/

function createDay(date){

if(journal[date]) return;

journal[date]={

header:{

date:date,

session:"Asia",

marketBias:"Bullish",

selectedSetup:""

},

trades:[],

notes:{

todayPlan:"",

tradeReview:"",

mistakes:"",

lessons:"",

tomorrowPlan:""

},

psychology:{

fear:false,

greed:false,

fomo:false,

revenge:false,

overTrading:false,

patience:false,

followPlan:false,

noEmotion:false

},

screenshots:{

before:"",

after:"",

mistake:""

}

};

}

/*=========================================================
SAVE DATABASE
=========================================================*/

function saveDatabase(){

localStorage.setItem(

"TradingJournalV2",

JSON.stringify(journal)

);

}

/*=========================================================
LOAD DAY
=========================================================*/

function loadDay(date){

createDay(date);

currentDate=date;

const day=journal[date];

session.value=day.header.session;

marketBias.value=day.header.marketBias;

loadTrades();

loadNotes();

loadPsychology();

loadScreenshots();

updateSummary();

}

/*=========================================================
AUTO SAVE HEADER
=========================================================*/

session.addEventListener("change",()=>{

journal[currentDate].header.session=session.value;

saveDatabase();

});

marketBias.addEventListener("change",()=>{

journal[currentDate].header.marketBias=marketBias.value;

saveDatabase();

});

journalDate.addEventListener("change",()=>{

loadDay(journalDate.value);

});

/*=========================================================
ADD TRADE
=========================================================*/

addTrade.addEventListener("click", () => {
    createDay(currentDate);
    journal[currentDate].trades.push({
        id: Date.now(),
        time: "",
        pair: "",
        direction: "Buy",
        quantity: 1,
        entry: 0,
        exit: 0,
        pl: 0,
        emotion: "Confidence",
        mistake: "1 NONE", // Default mistake state
        rule: "Yes"
    });
    loadTrades();
    saveDatabase();
    updateSummary();
});

/*=========================================================
START
=========================================================*/

/*========================================================
DISCIPLINE ADVANCED TRADER JOURNAL V2
script.js
Part 2
=========================================================*/

const setupCards = document.querySelectorAll(".setup-card");
const setupDetails = document.getElementById("setupDetails");
const detailTitle = document.getElementById("detailTitle");
const detailBadge = document.getElementById("detailBadge");
const setupRules = document.getElementById("setupRules");
const setupNote = document.getElementById("setupNote");
const resetSetup = document.getElementById("resetSetup");

const setupData = {
    "A1+": {
        badge: "Aggressive Entry",
        confidence: "100% Confident - BEST 85%",
        note: "[NOTE] Multiple levels pe jitne reasons hote he market utne time vaha se move karta he.",
        setups: [
            "TREND FEVER SWEENG 2 SE 85 RETRES + TRENDLINE + HEAD & SOLDER + FLIP CANDLE",
            "TREND FEVER SWEENG 2 SE 85 RETRES + 62 YA 50 MULTIPLE RETRES LEVEL SAM JAGAH PUR + FLIP CANDLE",
            "TREND FEVER SWEENG 2 SE 85 RETRES + FLIP CANDLE"
        ]
    },
    "A1": {
        badge: "Aggressive Entry",
        confidence: "90% Confident - BEST 62%",
        note: "[IMP NOT] (1) Same signal 85 level pe ho and level gap 50 point ke niche ho to 85 level pe entry karna he. (2) Multiple levels pe jitne reasons hote he market utne time vaha se move karta he.",
        setups: [
            "TREND FEVER SWEENG 2 SE 62 RETRES + TRENDLINE + HEAD & SOLDER + FLIP CANDLE",
            "TREND FEVER SWEENG 2 SE 62 RETRES + 62 YA 50 MULTIPLE RETRES LEVEL SAM JAGAH PUR + FLIP CANDLE",
            "TREND FEVER SWEENG 2 SE 62 RETRES pe aake market ne move kiya ho to us din market pura din Sweeng 2 se 62 level se move karega -> Next time 62 level pe aggressive entry le sakte he.",
            "BIG GAP DOWN YA GAP UP: Preves day close candle ya last sweeng se 62 + Multiple ya Head & Solder + Flip Candle",
            "SWEENG 2 RETRES 62 LEVEL ONLY 100 Point + ho."
        ]
    },
    "B1": {
        badge: "Conformation Entry",
        confidence: "90% Confident - MY GOOD B1+",
        note: "GAP UP / DOWN + WICK SETUP: High momentum condition setups.",
        setups: [
            "GAP DOWN SETUP: Big gap down + continue up + 62 retrest + flip + ya head & sloder + multiple + aggressive entry.",
            "GAP DOWN SETUP: Gap down + up aye multiple level tuch 62 + 85.",
            "GAP UP SETUP: Gap up opnig thay pachi down ave 60% ya 85% tuch thay, conformatione ape and up jay.",
            "GAP UP SETUP: Big gap up + 62 retrest + tredline ya multipole to aggressive entry.",
            "GAP UP SETUP: Gap up + down 62 ya 85 market tuch and up + BOS and jaha se up gaya tha vaha firse tuch hoke up ja sakta he.",
            "WICK SETUP: Market up ya down ja raha ho to candle preves candle ke apposit candle banaye to wick conforme hoti he.",
            "WICK SETUP: Wick se 85 ka level niklna he ya big move hoto 62 + multipole ya trendline + flip.",
            "WICK SETUP: Small candle ho to puri candle zone mark karna he and badi candle ho to sirf wick zone mark karna he.",
            "WICK SETUP: Most of the time ye setup continu up ya down me hi use kare.",
            "WICK SETUP: Near buy koi sweeng na ho to sweep se 85 and big move ho to 62 pe bhi tred le sakte he."
        ]
    },
    "B2+": {
        badge: "Confirmation / Core Setups",
        confidence: "80% Confident",
        note: "Reversal, Continue/Confuse and 15 Minute candle breakdown validation rules.",
        setups: [
            "REVERSAL SETUP: 1st point Indsment strong candl thi breck thay. 2nd point market indsment breck kari ne continue ye disa ma move kare. 3rd point Indsment breck karke uska supporte le and move kare.",
            "REVERSAL SETUP: Market kahi ek level pe ja ke time spend kare 50 to 60 minute and us zone me hidden revsal setup banye (Small Indsment breck, minor high banave, niche aya vager bijo minor high banave).",
            "REVERSAL SETUP: Tub ek sweeng indsment ho jayega and preves sweeng 1 and 2 ho jayega to S2 se 62 and 85 level mark karna he. 85 good entry, 62 pe extra conformatione ho to entry le sakte he.",
            "REVERSAL SETUP: Reversal setup me market ne jaha se apposit move kiya ho us candle tak stop loss rahkna chaye. Sweeng 2 market breck karde to bhi market revers ho jata he.",
            "CONTINUE / CONFUSE SETUP: BOS hona chahiye is setup me, indsment ki jarurt nahi hoti.",
            "CONTINUE / CONFUSE SETUP: Sweeng pe trendline draw karna he and trendline ke start point ko sweeng kah sakte he, ese 2 sweeng mark karo.",
            "CONTINUE / CONFUSE SETUP: 85 flip level ya fir bada zone hoto 62 + extra conformation jese trendline ya head & solder + FVG + flip.",
            "CONTINUE / CONFUSE SETUP: Continue market me trendline + 62 ya 85 vale zone me aggressive entry kare. Time 12 baje ke baad ya morning me small setup ke hisab se.",
            "15 MINUTE CANDLE BRECK SETUP: 15 minute breck candle strong moroboju honi chaye us breck level pe 62 ya 85 level hona chaye.",
            "15 MINUTE CANDLE BRECK SETUP: Near me koi good setup nahi hona chaye trend fever ho to us zone me entry kar sakte he.",
            "15 MINUTE CANDLE BRECK SETUP: 15Breck + 62 ya 85 + FVG ya trendline + flip candle entry zone."
        ]
    }
};

let activeCategoryView = "";

function showSetupCategory(categoryName) {
  const categoryInfo = setupData[categoryName];
  if (!categoryInfo) return;

  activeCategoryView = categoryName;

  // UI elements update
  detailTitle.innerHTML = `${categoryName} <span style="font-size: 16px; font-weight: 500; color: #b9b9b9; margin-left: 10px;">(${categoryInfo.confidence})</span>`;
  detailBadge.textContent = categoryInfo.badge;
  setupNote.textContent = categoryInfo.note;

  setupRules.innerHTML = "";
  
  const savedSelection = journal[currentDate].header.selectedSetup || "";
  let isAnyCheckboxChecked = savedSelection.startsWith(categoryName + " - Setup ");

  categoryInfo.setups.forEach((setupText, index) => {
    const uniqueSetupId = `${categoryName} - Setup ${index + 1}`;
    const isThisChecked = (savedSelection === uniqueSetupId);

    // Checkbox select -> baaki hide logic
    if (isAnyCheckboxChecked && !isThisChecked) {
      return; 
    }

    const li = document.createElement("li");
    
    // CSS layout ke sath dynamic adjustment
    li.style.display = "flex";
    li.style.alignItems = "center"; 
    li.style.gap = "15px";
    li.style.marginBottom = "15px";
    li.style.cursor = "pointer";

    // CSS counter ring ko use karne ke liye innerHTML clean kiya
    li.innerHTML = `
      <input type="checkbox" class="setup-custom-chk" data-id="${uniqueSetupId}" ${isThisChecked ? 'checked' : ''} style="transform: scale(1.4); width: 20px; height: 20px; cursor: pointer; accent-color: #19d76b; flex-shrink: 0;">
      <div class="setup-text-box" style="flex: 1; line-height: 1.6; font-size: 20px; color: #f1f5f9;">
        ${setupText}
      </div>
    `;

    const checkboxElement = li.querySelector(".setup-custom-chk");
    const textElement = li.querySelector(".setup-text-box");

    const triggerCheckboxToggle = () => {
      if (checkboxElement.checked) {
        journal[currentDate].header.selectedSetup = uniqueSetupId;
      } else {
        journal[currentDate].header.selectedSetup = "";
      }
      saveDatabase();
      showSetupCategory(categoryName); 
    };

    checkboxElement.addEventListener("change", triggerCheckboxToggle);
    textElement.addEventListener("click", () => {
      checkboxElement.checked = !checkboxElement.checked;
      triggerCheckboxToggle();
    });

    setupRules.appendChild(li);
  });

  setupDetails.classList.add("show");

  // Category cards sync
  setupCards.forEach(card => {
    card.classList.remove("active");
    card.classList.remove("hide");
    if (card.dataset.setup === categoryName) {
      card.classList.add("active");
    } else {
      card.classList.add("hide");
    }
  });
}

/*=========================================================
SETUP CARDS CLICK EVENTS
=========================================================*/
setupCards.forEach(card => {
  card.addEventListener("click", () => {
    showSetupCategory(card.dataset.setup);
  });
});

/*=========================================================
RESET ACTION (SAB WAPAS)
=========================================================*/
resetSetup.addEventListener("click", () => {
  journal[currentDate].header.selectedSetup = "";
  saveDatabase();
  
  setupDetails.classList.remove("show");
  activeCategoryView = "";
  
  setupCards.forEach(card => {
    card.classList.remove("active");
    card.classList.remove("hide");
  });
});

/*=========================================================
LOAD SETUP (AUTOMATIC FROM LOCALSTORAGE)
=========================================================*/
function loadSetup() {
  const selected = journal[currentDate].header.selectedSetup || "";
  setupDetails.classList.remove("show");
  
  setupCards.forEach(card => {
    card.classList.remove("active");
    card.classList.remove("hide");
  });

  if (selected) {
    const rootCategory = selected.split(" - ")[0];
    if (setupData[rootCategory]) {
      showSetupCategory(rootCategory);
    }
  } else if (activeCategoryView) {
    showSetupCategory(activeCategoryView);
  }
}

/*=========================================================
LOAD TRADES & OPERATIONS
=========================================================*/
function loadTrades() {
    tradeBody.innerHTML = "";
    const trades = journal[currentDate].trades;

    trades.forEach((trade, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><input class="time" value="${trade.time}"></td>
            <td><input class="pair" value="${trade.pair}"></td>
            <td>
                <select class="direction">
                    <option ${trade.direction === "Buy" ? "selected" : ""}>Buy</option>
                    <option ${trade.direction === "Sell" ? "selected" : ""}>Sell</option>
                </select>
            </td>
            <td><input class="quantity" type="number" step="0.01" value="${trade.quantity}"></td>
            <td><input class="entry" type="number" step="0.01" value="${trade.entry}"></td>
            <td><input class="exit" type="number" step="0.01" value="${trade.exit}"></td>
            <td><input class="pl" readonly value="${trade.pl}"></td>
            <td>
                <select class="emotion">
                    <option ${trade.emotion === "Confidence" ? "selected" : ""}>Confidence</option>
                    <option ${trade.emotion === "Normal" ? "selected" : ""}>Normal</option>
                    <option ${trade.emotion === "Fear" ? "selected" : ""}>Fear</option>
                    <option ${trade.emotion === "Greed" ? "selected" : ""}>Greed</option>
                    <option ${trade.emotion === "FOMO" ? "selected" : ""}>FOMO</option>
                    <option ${trade.emotion === "Revenge" ? "selected" : ""}>Revenge</option>
                </select>
            </td>
            <td>
                <select class="mistake-select">
                    <option ${trade.mistake === "NONE" || trade.mistake === "1 NONE" ? "selected" : ""}>1 NONE</option>
                    <option ${trade.mistake === "2 FOMO ENTRY" ? "selected" : ""}>2 FOMO ENTRY</option>
                    <option ${trade.mistake === "3 FEAR EXIT" ? "selected" : ""}>3 FEAR EXIT</option>
                    <option ${trade.mistake === "4 OVER TRADING" ? "selected" : ""}>4 OVER TRADING</option>
                    <option ${trade.mistake === "5 STOPLOSS MOVE" ? "selected" : ""}>5 STOPLOSS MOVE</option>
                    <option ${trade.mistake === "6 STUCK IN LOSS" ? "selected" : ""}>6 STUCK IN LOSS</option>
                    <option ${trade.mistake === "7 NOT FOLLOW SETUP" ? "selected" : ""}>7 NOT FOLLOW SETUP</option>
                    <option ${trade.mistake === "8 OPPOSITE TREND" ? "selected" : ""}>8 OPPOSITE TREND</option>
                    <option ${trade.mistake === "9 MISS GOOD TRADE" ? "selected" : ""}>9 MISS GOOD TRADE</option>
                    <option ${trade.mistake === "10 REVENGE TRADE" ? "selected" : ""}>10 REVENGE TRADE</option>
                    <option ${trade.mistake === "11 HOPE YA GUESS" ? "selected" : ""}>11 HOPE YA GUESS</option>
                </select>
            </td>
            <td>
                <select class="rule">
                    <option ${trade.rule === "Yes" ? "selected" : ""}>Yes</option>
                    <option ${trade.rule === "Partial" ? "selected" : ""}>Partial</option>
                    <option ${trade.rule === "No" ? "selected" : ""}>No</option>
                </select>
            </td>
            <td><button class="delete-btn">Delete</button></td>
        `;
        tradeBody.appendChild(row);
        attachTradeEvents(row, index);
    });
    loadSetup();
}

/*=========================================================
ATTACH TRADE EVENTS
=========================================================*/
function attachTradeEvents(row, index) {
    row.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", () => {
            updateTrade(row, index);
        });
    });

    row.querySelectorAll("select").forEach(select => {
        select.addEventListener("change", () => {
            updateTrade(row, index);
        });
    });

    const deleteBtn = row.querySelector(".delete-btn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            journal[currentDate].trades.splice(index, 1);
            loadTrades();
            saveDatabase();  
            updateSummary();
        });
    }
}

/*=========================================================
UPDATE TRADE & CURRENT ROW STATUS
=========================================================*/
function updateTrade(row, index) {
    const trades = journal[currentDate].trades;
    const trade = trades[index];

    trade.time = row.querySelector(".time").value;
    trade.pair = row.querySelector(".pair").value;
    trade.direction = row.querySelector(".direction").value;
    trade.quantity = parseFloat(row.querySelector(".quantity").value) || 0;
    trade.entry = parseFloat(row.querySelector(".entry").value) || 0;
    trade.exit = parseFloat(row.querySelector(".exit").value) || 0;
    trade.emotion = row.querySelector(".emotion").value;
    trade.mistake = row.querySelector(".mistake-select").value; 
    trade.rule = row.querySelector(".rule").value;

    calculateTrade(trade);
    
    row.querySelector(".pl").value = trade.pl;

    if (Number(trade.pl) > 0) {
        row.querySelector(".pl").className = "pl profit";
    } else if (Number(trade.pl) < 0) {
        row.querySelector(".pl").className = "pl loss";
    } else {
        row.querySelector(".pl").className = "pl";
    }
    
   saveDatabase(); 
    updateSummary();
}

/*=========================================================
CALCULATE TRADE
=========================================================*/
function calculateTrade(trade) {
    let points = 0;
    if (trade.direction === "Buy") {
        points = trade.exit - trade.entry;
    } else {
        points = trade.entry - trade.exit;
    }
    trade.pl = (points * trade.quantity).toFixed(2);
}

/*=========================================================
SAVE DATABASE
=========================================================*/
async function saveDatabase() {

    console.log("saveDatabase called");
    console.log("Journal Data:", journal);

    try {

        const response = await fetch("/api/journal", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(journal)
        });

        console.log("POST Status:", response.status);

    } catch (err) {

        console.error("Save Error:", err);

    }

    updateSummary();
    buildCalendar();
}

/*=========================================================
SUMMARY
=========================================================*/

function updateSummary(){

const trades=

journal[currentDate].trades;

let total=trades.length;

let wins=0;

let losses=0;

let net=0;

let best=0;

let worst=0;

let rr=0;

trades.forEach(trade=>{

const pl=Number(trade.pl)||0;

net+=pl;

rr+=Number(trade.reward)||0;

if(pl>0){

wins++;

}

if(pl<0){

losses++;

}

if(pl>best){

best=pl;

}

if(pl<worst){

worst=pl;

}

});

const averageRR=

total

?

(rr/total).toFixed(2)

:

"0.00";

const rate=

total

?

((wins/total)*100).toFixed(2)+"%"

:

"0%";

/*=========================================================
UPDATE DASHBOARD
=========================================================*/

document.getElementById("totalTrades").value=total;

document.getElementById("winningTrades").value=wins;

document.getElementById("losingTrades").value=losses;

document.getElementById("winRate").value=rate;

document.getElementById("netProfit").value=

net.toFixed(2);

document.getElementById("bestTrade").value=

best.toFixed(2);

document.getElementById("worstTrade").value=

worst.toFixed(2);

document.getElementById("averageRR").value=

averageRR;

}/*=========================================================
DISCIPLINE ADVANCED TRADER JOURNAL V2
script.js
Part 4
CALENDAR SYSTEM
=========================================================*/

/*=========================================================
CALENDAR
=========================================================*/

const calendar=document.getElementById("calendar");

const calendarMonth=document.getElementById("calendarMonth");

const calendarYear=document.getElementById("calendarYear");

const prevMonth=document.getElementById("prevMonth");

const nextMonth=document.getElementById("nextMonth");

/*=========================================================
MONTHS
=========================================================*/

const months=[

"January",

"February",

"March",

"April",

"May",

"June",

"July",

"August",

"September",

"October",

"November",

"December"

];

/*=========================================================
YEAR LIST
=========================================================*/

for(let y=2024;y<=2055;y++){

const option=document.createElement("option");

option.value=y;

option.textContent=y;

calendarYear.appendChild(option);

}

/*=========================================================
MONTH LIST
=========================================================*/

months.forEach((month,index)=>{

const option=document.createElement("option");

option.value=index;

option.textContent=month;

calendarMonth.appendChild(option);

});

calendarMonth.value=today.getMonth();

calendarYear.value=today.getFullYear();

/*=========================================================
BUILD CALENDAR
=========================================================*/

function buildCalendar(){

calendar.innerHTML="";

/* Week Header */

const week=[

"Sun",

"Mon",

"Tue",

"Wed",

"Thu",

"Fri",

"Sat"

];

week.forEach(day=>{

const head=document.createElement("div");

head.className="calendar-head";

head.textContent=day;

calendar.appendChild(head);

});

const month=

Number(calendarMonth.value);

const year=

Number(calendarYear.value);

const firstDay=

new Date(year,month,1).getDay();

const totalDays=

new Date(year,month+1,0).getDate();

/* Empty */

for(let i=0;i<firstDay;i++){

const empty=document.createElement("div");

empty.className="calendar-empty";

calendar.appendChild(empty);

}

/* Days */

for(let day=1;day<=totalDays;day++){

const box=document.createElement("div");

box.className="calendar-day";

const date=

`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

box.dataset.date=date;

box.innerHTML=`<span>${day}</span>`;

/*=========================================================
COLOR
=========================================================*/

if(journal[date]){

let total=0;

journal[date].trades.forEach(trade=>{

total+=Number(trade.pl)||0;

});

if(total>0){

box.classList.add("calendar-profit");

}

else if(total<0){

box.classList.add("calendar-loss");

}

}

/*=========================================================
TODAY
=========================================================*/

if(date===currentDate){

box.style.outline="3px solid gold";

}

/*=========================================================
CLICK
=========================================================*/

box.addEventListener("click",()=>{

journalDate.value=date;

loadDay(date);

document.getElementById(

"selectedDateText"

).textContent=

"Selected : "+date;

});

calendar.appendChild(box);

}

}

/*=========================================================
PREVIOUS
=========================================================*/

prevMonth.addEventListener("click",()=>{

let month=

Number(calendarMonth.value);

let year=

Number(calendarYear.value);

month--;

if(month<0){

month=11;

year--;

}

calendarMonth.value=month;

calendarYear.value=year;

buildCalendar();

});

/*=========================================================
NEXT
=========================================================*/

nextMonth.addEventListener("click",()=>{

let month=

Number(calendarMonth.value);

let year=

Number(calendarYear.value);

month++;

if(month>11){

month=0;

year++;

}

calendarMonth.value=month;

calendarYear.value=year;

buildCalendar();

});

/*=========================================================
CHANGE
=========================================================*/

calendarMonth.addEventListener(

"change",

buildCalendar

);

calendarYear.addEventListener(

"change",

buildCalendar

);

/*=========================================================
FIRST LOAD
=========================================================*/

buildCalendar();/*=========================================================
DISCIPLINE ADVANCED TRADER JOURNAL V2
script.js
Part 5 (FINAL)
=========================================================*/

/*=========================================================
NOTES
=========================================================*/

function loadNotes(){

const notes=journal[currentDate].notes;

document.getElementById("todayPlan").value=notes.todayPlan;

document.getElementById("tradeReview").value=notes.tradeReview;

document.getElementById("mistakes").value=notes.mistakes;

document.getElementById("lessons").value=notes.lessons;

document.getElementById("tomorrowPlan").value=notes.tomorrowPlan;

}

[
"todayPlan",
"tradeReview",
"mistakes",
"lessons",
"tomorrowPlan"

].forEach(id=>{

const el=document.getElementById(id);

el.addEventListener("input",()=>{

journal[currentDate].notes[id]=el.value;

saveDatabase();

});

});

/*=========================================================
PSYCHOLOGY
=========================================================*/

function loadPsychology(){

const p=journal[currentDate].psychology;

document.getElementById("fear").checked=p.fear;

document.getElementById("greed").checked=p.greed;

document.getElementById("fomo").checked=p.fomo;

document.getElementById("revenge").checked=p.revenge;

document.getElementById("overTrading").checked=p.overTrading;

document.getElementById("patience").checked=p.patience;

document.getElementById("followPlan").checked=p.followPlan;

document.getElementById("noEmotion").checked=p.noEmotion;

}

[
"fear",
"greed",
"fomo",
"revenge",
"overTrading",
"patience",
"followPlan",
"noEmotion"

].forEach(id=>{

document.getElementById(id)

.addEventListener("change",()=>{

journal[currentDate].psychology[id]=

document.getElementById(id).checked;

saveDatabase();

});

});

/*=========================================================
SCREENSHOTS
=========================================================*/

function imageUpload(inputId,key,imageId){

const input=document.getElementById(inputId);

const img=document.getElementById(imageId);

const zone=input.closest(".drop-zone");

const removeBtn=zone.querySelector(".remove-image");

/* ---------- SAVE IMAGE ---------- */

function saveImage(file){

    if(!file) return;

    const reader=new FileReader();

    reader.onload=e=>{

        journal[currentDate].screenshots[key]=e.target.result;

        img.src=e.target.result;

        img.style.display="block";

        img.style.pointerEvents="auto";

        saveDatabase();

    };

    reader.readAsDataURL(file);

}

/* ---------- CHOOSE FILE ---------- */

input.addEventListener("change",()=>{

    if(input.files.length){

        saveImage(input.files[0]);

    }

});

/* ---------- CLICK EMPTY BOX ---------- */

zone.addEventListener("click",(e)=>{

    if(
        e.target===img ||
        e.target===removeBtn
    ){
        return;
    }

    input.click();

});

/* ---------- IMAGE FULL SCREEN ---------- */

img.addEventListener("click",(e)=>{

    e.preventDefault();

    e.stopPropagation();

    const image=journal[currentDate].screenshots[key];

    if(!image) return;

    const win=window.open();

    win.document.write(`
    <html>
    <head>
    <title>Chart</title>
    <style>
    body{
    margin:0;
    background:#000;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
    }
    img{
    max-width:100%;
    max-height:100%;
    object-fit:contain;
    }
    </style>
    </head>
    <body>
    <img src="${image}">
    </body>
    </html>
    `);

});

/* ---------- DRAG ---------- */

zone.addEventListener("dragover",(e)=>{

    e.preventDefault();

    zone.classList.add("drag-over");

});

zone.addEventListener("dragleave",()=>{

    zone.classList.remove("drag-over");

});

zone.addEventListener("drop",(e)=>{

    e.preventDefault();

    zone.classList.remove("drag-over");

    const file=e.dataTransfer.files[0];

    if(file && file.type.startsWith("image/")){

        saveImage(file);

    }

});

/* ---------- CTRL + V ---------- */

zone.setAttribute("tabindex","0");

zone.addEventListener("paste",(e)=>{

    const items=e.clipboardData.items;

    for(const item of items){

        if(item.type.startsWith("image/")){

            saveImage(item.getAsFile());

            e.preventDefault();

            return;

        }

    }

});

/* ---------- DELETE ---------- */

removeBtn.addEventListener("click",(e)=>{

    e.stopPropagation();

    journal[currentDate].screenshots[key]="";

    img.src="";

    img.style.display="none";

    img.style.pointerEvents="none";

    input.value="";

    saveDatabase();

});

} // imageUpload End

/* ---------- LOAD SCREENSHOTS ---------- */

function loadScreenshots(){

const map=[
["before","beforePreview"],
["after","afterPreview"],
["mistake","mistakePreview"]
];

map.forEach(([key,id])=>{

    const img=document.getElementById(id);

    const data=journal[currentDate].screenshots[key];

    if(data){

        img.src=data;
        img.style.display="block";
        img.style.pointerEvents="auto";

    }else{

        img.src="";
        img.style.display="none";
        img.style.pointerEvents="none";

    }

});

}

/* ---------- INIT ---------- */

imageUpload("beforeChart","before","beforePreview");
imageUpload("afterChart","after","afterPreview");
imageUpload("mistakeChart","mistake","mistakePreview");



/*=========================================================
SAVE BUTTON
=========================================================*/

saveTrade.addEventListener("click",()=>{

saveDatabase();

alert("Trade Saved Successfully.");

});

/*=========================================================
SEARCH
=========================================================*/

document.getElementById("searchTrade")

.addEventListener("input",e=>{

const search=e.target.value.toLowerCase();

document.querySelectorAll("#tradeBody tr")

.forEach(row=>{

const pair=row.querySelector(".pair").value.toLowerCase();

row.style.display=

pair.includes(search)

?""

:"none";

});

});

/*=========================================================
CLEAR
=========================================================*/

document.getElementById("clearJournal")

.addEventListener("click",()=>{

if(!confirm("Delete Today's Journal ?")) return;

delete journal[currentDate];

saveDatabase();

loadDay(currentDate);

buildCalendar();

});

/*=========================================================
BACKUP
=========================================================*/

document.getElementById("backupData")

.addEventListener("click",()=>{

const blob=new Blob(

[JSON.stringify(journal)],

{type:"application/json"}

);

const a=document.createElement("a");

a.href=URL.createObjectURL(blob);

a.download="TradingJournalBackup.json";

a.click();

});

/*=========================================================
RESTORE
=========================================================*/

document.getElementById("restoreData")

.addEventListener("click",()=>{

document.getElementById("restoreFile").click();

});

document.getElementById("restoreFile")

.addEventListener("change",e=>{

const file=e.target.files[0];

if(!file) return;

const reader=new FileReader();

reader.onload=x=>{

journal=JSON.parse(x.target.result);

saveDatabase();

loadDay(currentDate);

buildCalendar();

alert("Backup Restored");

};

reader.readAsText(file);

});

/*=========================================================
PRINT
=========================================================*/

document.getElementById("printJournal")

.addEventListener("click",()=>{

window.print();

});

/*=========================================================
EXCEL
=========================================================*/

document.getElementById("exportExcel")

.addEventListener("click",()=>{

const sheet=

XLSX.utils.json_to_sheet(

journal[currentDate].trades

);

const wb=

XLSX.utils.book_new();

XLSX.utils.book_append_sheet(

wb,

sheet,

"Trades"

);

XLSX.writeFile(

wb,

"TradingJournal.xlsx"

);

});

/*=========================================================
PDF
=========================================================*/

document.getElementById("exportPDF")

.addEventListener("click",()=>{

const {jsPDF}=window.jspdf;

const pdf=new jsPDF();

pdf.setFontSize(18);

pdf.text(

"DISCIPLINE ADVANCED TRADER",

20,

20

);

pdf.setFontSize(11);

pdf.text(

"Date : "+currentDate,

20,

35

);

let y=50;

journal[currentDate].trades

.forEach((trade,index)=>{

pdf.text(

`${index+1}. ${trade.pair} | ${trade.direction} | Qty:${trade.quantity} | P/L:${trade.pl}`,

20,

y

);

y+=8;

if(y>280){

pdf.addPage();

y=20;

}

});

pdf.save("TradingJournal.pdf");

});

/*=========================================================
FINAL LOAD
=========================================================*/
loadDay(currentDate);
buildCalendar();
console.log(
"DISCIPLINE ADVANCED TRADER JOURNAL V2 READY"
);

/*=========================================================
END OF FILE
=========================================================*/ 
/*=========================================================
RAZORPAY SUBSCRIPTION INTEGRATION (DAY 4)
=========================================================*/
document.querySelectorAll('.buy-plan-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
        const amount = e.target.getAttribute('data-amount');
        const originalText = e.target.innerText;
        e.target.innerText = "Processing...";
        e.target.disabled = true;

        try {
            const response = await fetch('/api/create-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amount })
            });
            
            const data = await response.json();

            if (!data.success) {
                alert("Subscription initialization failed! Please try again.");
                e.target.innerText = originalText;
                e.target.disabled = false;
                return;
            }

            // MOCK/TEST MODE AUTOMATIC HANDLING
            if (data.isMock) {
                alert(`🎉 [TEST MODE SUCCESS]\nSubscription Activated Successfully!\nAmount: ₹${amount}\nSubscription ID: ${data.subscription_id}`);
                e.target.innerText = originalText;
                e.target.disabled = false;
                localStorage.setItem("isTraderPremium", "true");
                window.location.reload();
                return;
            }

            // REAL RAZORPAY POPUP
            const options = {
                "key": data.key_id, 
                "subscription_id": data.subscription_id, 
                "name": "Discipline Advanced Trader Pro",
                "description": `Premium Plan - ₹${amount}/period`,
                "image": "https://img.icons8.com/fluency/96/crown.png", 
                "handler": function (response) {
                    alert("🎉 Payment Successful! Subscription Activated.");
                    window.location.reload(); 
                },
                "theme": { "color": "#d4af37" },
                "modal": {
                    "ondismiss": function(){
                        e.target.innerText = originalText;
                        e.target.disabled = false;
                    }
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Error:", error);
            alert("Server connection error!");
            e.target.innerText = originalText;
            e.target.disabled = false;
        }
    });
});

// Tab switcher (Login <-> Signup)
function switchAuthTab(type) {
    document.getElementById('tabLogin').classList.toggle('active', type === 'login');
    document.getElementById('tabSignup').classList.toggle('active', type === 'signup');
    document.getElementById('loginForm').classList.toggle('active', type === 'login');
    document.getElementById('signupForm').classList.toggle('active', type === 'signup');
    
    // Clear old errors
    document.getElementById('loginError').innerText = "";
    document.getElementById('signupError').innerText = "";
    document.getElementById('signupSuccess').innerText = "";
}

// Handle Form Submission
async function handleAuthSubmit(event, type) {
    event.preventDefault();
    
    const emailId = type === 'login' ? 'loginEmail' : 'signupEmail';
    const passwordId = type === 'login' ? 'loginPassword' : 'signupPassword';
    const errorId = type === 'login' ? 'loginError' : 'signupError';
    
    const email = document.getElementById(emailId).value;
    const password = document.getElementById(passwordId).value;
    const errorEl = document.getElementById(errorId);
    
    errorEl.innerText = ""; // clear message

    try {
        const url = type === 'login' ? '/api/auth/login' : '/api/auth/signup';
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong");
        }

        if (type === 'signup') {
            document.getElementById('signupSuccess').innerText = "Registration successful! Switch to login tab.";
            document.getElementById('signupForm').reset();
        } else {
            // LOGIN SUCCESS: Token save karein browser storage me
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Modal gayab karein aur dashboard dikhayein
            document.getElementById('authModal').style.display = 'none';
            alert("Logged in successfully!");
            
            // Login hote hi agar admin hai toh button turant dikhao
            if (typeof checkAdminButton === 'function') checkAdminButton();
            
            if (typeof loadJournal === 'function') loadJournal(); 
        }

    } catch (err) {
        errorEl.innerText = err.message;
    }
}

// Page load par check karein ki user logged in hai ya nahi
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('authModal').style.display = 'none';
    } else {
        document.getElementById('authModal').style.display = 'flex';
    }
});

/*=========================================================
👑 ADMIN DASHBOARD REAL ACTIONS & EVENT HANDLERS
=========================================================*/

// Admin Panel Open karne ka action
function goToAdminPanel() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.style.display = 'flex';
        fetchAdminData(); // Backend se data kheenchne wala function
    }
}

// Admin Panel Close karne ka action
function closeAdminPanel() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.style.display = 'none';
}

// Backend API se Live Users and Income Stats Fetch karna
async function fetchAdminData() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error("Unauthorized Access! Admin validation failed.");
        
        const data = await response.json();
        
        // Counters updating
        document.getElementById('adminTotalUsers').innerText = data.totalUsers || 0;
        document.getElementById('adminPaidUsers').innerText = data.paidUsers || 0;
        document.getElementById('adminRevenue').innerText = `₹${data.revenue || 0}`;
        
        // Dynamic Table rows manipulation
        const tbody = document.getElementById('adminUsersTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            
            data.users.forEach(u => {
                const statusBadge = u.isPaid 
                    ? `<span style="background: #22c55e; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; color: black;">PRO</span>`
                    : `<span style="background: #64748b; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: white;">FREE</span>`;
                    
                const actionBtn = `<button onclick="toggleUserPlan('${u.email}', ${u.isPaid})" style="background: #d4af37; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; color: black; font-weight: bold; font-size: 11px;">
                    ${u.isPaid ? 'Downgrade' : 'Upgrade to Pro'}
                </button>`;

                tbody.innerHTML += `
                    <tr style="border-bottom: 1px solid var(--border);">
                        <td style="padding: 12px;">${u.email}</td>
                        <td style="padding: 12px; color: #d4af37;">${u.role || 'user'}</td>
                        <td style="padding: 12px;">${statusBadge}</td>
                        <td style="padding: 12px; color: var(--text2);">${u.planExpiry || 'N/A'}</td>
                        <td style="padding: 12px; text-align: center;">${u.email === 'mosinmansuri1432@gmail.com' ? '👑 Owner' : actionBtn}</td>
                    </tr>
                `;
            });
        }
        
    } catch (err) {
        console.error("Failed to load admin panel data:", err);
        const tbody = document.getElementById('adminUsersTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="5" style="padding:20px; text-align:center; color:#ff4757;">Error loading admin database. API endpoints are being ready...</td></tr>`;
        }
    }
}

// User Ka status manually change karne ka frontend logic
async function toggleUserPlan(email, currentStatus) {
    if(!confirm(`Kya aap sach me is user ka subscription status badalna chahte hain?`)) return;
    try {
        const response = await fetch('/api/admin/toggle-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ email, isPaid: !currentStatus })
        });
        if(response.ok) {
            fetchAdminData(); // Refresh list immediately
        } else {
            alert("Failed to update user plan on server.");
        }
    } catch (e) {
        alert("Status update network error!");
    }
}