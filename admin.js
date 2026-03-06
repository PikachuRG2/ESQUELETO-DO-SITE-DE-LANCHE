
function login(){

let u=document.getElementById("user").value
let p=document.getElementById("pass").value

if(u=="admin" && p=="123456"){
document.getElementById("login").style.display="none"
document.getElementById("painel").style.display="block"
carregar()
}else{
alert("Login inválido")
}

}

function carregar(){

let prevCount=0
setInterval(()=>{

let pedidos=JSON.parse(localStorage.getItem("pedidos")||"[]")

const search=document.getElementById("search").value||""
const norm=s=> (s||"").toString().replace(/\D/g,"").toLowerCase()
const filtra=p=>{
  const nome=(p.cliente?.nome||"").toLowerCase()
  const cpf=(p.cliente?.cpf||"")
  const q=search.toLowerCase()
  return !search || nome.includes(q) || norm(cpf).includes(norm(q))
}

let div=document.getElementById("pedidos")
div.innerHTML=""

const filtro=document.getElementById("statusFilter").value
const lista=(filtro==="todos"?pedidos:pedidos.filter(p=>p.status===filtro)).filter(filtra)
atualizarFila(pedidos)
lista.forEach(p=>{
  const val=((p.grandTotal||p.total).toFixed? (p.grandTotal||p.total).toFixed(2) : p.grandTotal||p.total)
  const eta= calcularETA(p, pedidos)
  div.innerHTML+=`<div style="margin-bottom:8px">
  <p>${p.cliente?.nome||""} - R$${val} - ${p.status} - ETA: ${eta}</p>
  <label>Alterar: 
    <select onchange="alterarStatus('${p.id||""}', this.value)">
      <option ${p.status==="Recebido"?"selected":""}>Recebido</option>
      <option ${p.status==="Preparando"?"selected":""}>Preparando</option>
      <option ${p.status==="Pronto"?"selected":""}>Pronto</option>
      <option ${p.status==="Entregue"?"selected":""}>Entregue</option>
    </select>
  </label>
  <button onclick="printPedido(${JSON.stringify(p).replace(/"/g,'&quot;')})">Imprimir</button>
  </div>`
})

if(pedidos.length>prevCount){tocarSom()}
prevCount=pedidos.length

atualizarRelatorio(pedidos)
},2000)

}

function tocarSom(){
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)()
    const o=ctx.createOscillator()
    const g=ctx.createGain()
    o.type="sine"
    o.frequency.value=880
    o.connect(g); g.connect(ctx.destination)
    g.gain.setValueAtTime(0.001,ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.1,ctx.currentTime+0.02)
    o.start()
    setTimeout(()=>{g.gain.exponentialRampToValueAtTime(0.00001,ctx.currentTime+0.2); o.stop(ctx.currentTime+0.25)},200)
  }catch(e){}
}

function printPedido(p){
  const area=document.getElementById("printArea")
  area.innerHTML=`<h3>Recibo</h3>
  <p>Cliente: ${p.cliente?.nome||""} - CPF: ${p.cliente?.cpf||""}</p>
  <p>Itens:</p>
  ${p.itens.map(i=>`<p>${i.nome} - R$ ${i.preco}</p>`).join("")}
  <p>Entrega: ${p.tipoEntrega==="entrega"?`R$ ${p.taxaEntrega} - ${p.endereco}`:"Retirada"}</p>
  <p>Total: R$ ${((p.grandTotal||p.total)||0).toFixed? ((p.grandTotal||p.total)||0).toFixed(2) : (p.grandTotal||p.total)}</p>
  <p>Pagamento: ${p.pagamento}</p>`
  window.print()
}

function atualizarRelatorio(pedidos){
  const hoje=new Date()
  const dataStr=hoje.toLocaleDateString('pt-BR')
  document.getElementById("reportDate").innerText=dataStr
  const doDia=pedidos.filter(p=>{
    if(!p.criadoEm) return false
    const d=new Date(p.criadoEm)
    return d.getDate()===hoje.getDate() && d.getMonth()===hoje.getMonth() && d.getFullYear()===hoje.getFullYear()
  })
  document.getElementById("reportCount").innerText=doDia.length
  const total=doDia.reduce((acc,p)=>acc+Number(p.grandTotal||p.total||0),0)
  document.getElementById("reportTotal").innerText=total.toFixed(2)
}

function imprimirDia(){
  const data=document.getElementById("reportDate").innerText
  const qtd=document.getElementById("reportCount").innerText
  const total=document.getElementById("reportTotal").innerText
  const area=document.getElementById("printArea")
  area.innerHTML=`<h3>Relatório Diário</h3>
  <p>Data: ${data}</p>
  <p>Pedidos: ${qtd}</p>
  <p>Vendas: R$ ${total}</p>`
  window.print()
}

function alterarStatus(id,novo){
  let pedidos=JSON.parse(localStorage.getItem("pedidos")||"[]")
  const idx=pedidos.findIndex(p=>p.id===id)
  if(idx>=0){pedidos[idx].status=novo}
  else{
    for(let i=0;i<pedidos.length;i++){
      if(!pedidos[i].id){pedidos[i].status=novo; break}
    }
  }
  localStorage.setItem("pedidos",JSON.stringify(pedidos))
}

function atualizarFila(pedidos){
  const c={Recebido:0,Preparando:0,Pronto:0,Entregue:0}
  pedidos.forEach(p=>{if(c[p.status]!=null)c[p.status]++})
  const div=document.getElementById("filaStatus")
  div.innerHTML=`Recebido: ${c.Recebido} | Preparando: ${c.Preparando} | Pronto: ${c.Pronto} | Entregue: ${c.Entregue}`
}

function calcularETA(p,pedidos){
  const base=10
  const porItem=3
  const fila=pedidos.filter(x=>x.status==='Preparando').length
  const minutos= base + (p.itens?.length||1)*porItem + fila*2
  const dt=new Date()
  dt.setMinutes(dt.getMinutes()+minutos)
  const hh=String(dt.getHours()).padStart(2,'0')
  const mm=String(dt.getMinutes()).padStart(2,'0')
  return `${hh}:${mm}`
}

document.getElementById("search").addEventListener("input",()=>{})
