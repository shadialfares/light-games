const pools = {
  digits: ['0','1','2','3','4','5','6','7','8','9'],
  letters: ['A','B','C','D','E','F','G','H','I','J','K','L'],
  shapes: ['●','■','▲','★','♥','☀','☁','☂','⬤','⬛','🔺','✦']
}
const difficulties = {
  easy:{length:3,speed:800},
  medium:{length:5,speed:700},
  hard:{length:7,speed:600}
}
let currentCategory='digits'
let currentDifficulty='easy'
let sequence=[]
let userSeq=[]
let score=0
let round=1
const maxRounds=5
let playing=false
const screens={
  start:document.getElementById('start-screen'),
  game:document.getElementById('game-screen'),
  result:document.getElementById('result-screen')
}
const displayItem=document.getElementById('display-item')
const progressFill=document.getElementById('progress-fill')
const phaseText=document.getElementById('phase-text')
const choicesGrid=document.getElementById('choices-grid')
const inputSequence=document.getElementById('input-sequence')
const scoreEl=document.getElementById('score')
const roundEl=document.getElementById('round')
const startBtn=document.getElementById('start-btn')
const settingsBtn=document.getElementById('settings-btn')
const clearBtn=document.getElementById('clear-btn')
const submitBtn=document.getElementById('submit-btn')
let timeouts=[]
function addTimeout(fn,ms){const id=setTimeout(fn,ms);timeouts.push(id);return id}
function clearTimeouts(){timeouts.forEach(clearTimeout);timeouts=[]}
document.querySelectorAll('#category-options .opt-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    b.parentElement.querySelectorAll('.opt-btn').forEach(x=>x.classList.remove('selected'))
    b.classList.add('selected')
    currentCategory=b.dataset.value
  })
})
document.querySelectorAll('#difficulty-options .opt-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    b.parentElement.querySelectorAll('.opt-btn').forEach(x=>x.classList.remove('selected'))
    b.classList.add('selected')
    currentDifficulty=b.dataset.value
  })
})
startBtn.addEventListener('click',startGame)
settingsBtn.addEventListener('click',()=>{
  clearTimeouts()
  showScreen('start')
})
clearBtn.addEventListener('click',()=>{userSeq=[];renderInput()})
submitBtn.addEventListener('click',submitAnswer)
document.getElementById('restart-btn').addEventListener('click',()=>{showScreen('start')})
function showScreen(name){Object.values(screens).forEach(s=>s.classList.remove('active'));screens[name].classList.add('active')}
function startGame(){
  score=0;round=1
  updateHud()
  showScreen('game')
  nextRound()
}
function updateHud(){scoreEl.textContent=score;roundEl.textContent=`${round}/${maxRounds}`}
function nextRound(){
  playing=true
  userSeq=[]
  renderInput()
  phaseText.textContent='شاهد التسلسل بعناية'
  const len=difficulties[currentDifficulty].length
  const pool=[...pools[currentCategory]]
  sequence=[]
  for(let i=0;i<len;i++){const idx=Math.floor(Math.random()*pool.length);sequence.push(pool[idx])}
  buildChoices(pool)
  playSequence()
}
function buildChoices(pool){
  choicesGrid.innerHTML=''
  const options=pool.slice(0,12)
  options.forEach(ch=>{
    const btn=document.createElement('button')
    btn.className='choice-btn'
    btn.textContent=ch
    btn.disabled=true
    btn.addEventListener('click',()=>{if(!playing){userSeq.push(ch);renderInput()}})
    choicesGrid.appendChild(btn)
  })
}
function playSequence(){
  const speed=difficulties[currentDifficulty].speed
  let t=0
  progressFill.style.transition='none'
  progressFill.style.width='0%'
  sequence.forEach((item,i)=>{
    addTimeout(()=>{displayItem.textContent=item;progressFill.style.transition=`width ${speed}ms linear`;progressFill.style.width='100%'},t)
    addTimeout(()=>{displayItem.textContent='';progressFill.style.transition='none';progressFill.style.width='0%'},t+speed-150)
    t+=speed
  })
  addTimeout(()=>{
    displayItem.textContent='?'
    phaseText.textContent='أدخل التسلسل بالترتيب'
    Array.from(choicesGrid.children).forEach(b=>b.disabled=false)
    playing=false
  },t+150)
}
function renderInput(){
  inputSequence.innerHTML=''
  userSeq.forEach(x=>{
    const token=document.createElement('div')
    token.className='input-token'
    token.textContent=x
    inputSequence.appendChild(token)
  })
}
function submitAnswer(){
  if(playing) return
  if(userSeq.length!==sequence.length){phaseText.textContent='أكمل الإدخال أولاً';return}
  const ok=userSeq.every((x,i)=>x===sequence[i])
  if(ok){
    score+=10
    updateHud()
    phaseText.textContent='رائع! تسلسل صحيح'
    if(typeof confetti==='function'){confetti({particleCount:90,spread:70,origin:{y:.6}})}
    addTimeout(()=>{if(round<maxRounds){round++;updateHud();nextRound()}else{endGame()}},1200)
  }else{
    phaseText.textContent='خطأ في التسلسل'
    addTimeout(()=>{if(round<maxRounds){round++;updateHud();nextRound()}else{endGame()}},1200)
  }
}
function endGame(){
  document.getElementById('final-score').textContent=score
  const title=document.getElementById('result-title')
  const emoji=document.getElementById('result-emoji')
  if(score>=maxRounds*10){title.textContent='مذهل! ذاكرة ممتازة';emoji.textContent='🏆';if(typeof confetti==='function'){confetti({particleCount:120,spread:80,origin:{y:.6}})}}
  else if(score>=maxRounds*5){title.textContent='أداء جيد';emoji.textContent='🥈'}
  else {title.textContent='بحاجة إلى تدريب';emoji.textContent='🥉'}
  showScreen('result')
}
