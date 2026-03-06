
let produtos=[
{nome:"Hambúrguer Artesanal",preco:22,img:"https://images.unsplash.com/photo-1550547660-d9450f859349"},
{nome:"X-Bacon",preco:26,img:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd"},
{nome:"Batata Frita",preco:15,img:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877"}
]

let carrinho=[]
let cliente=null
let taxaEntrega=0
let grandTotal=0

const CONFIG={
  WHATSAPP_PHONE:"",
  PIX_CHAVE:"",
  PIX_NOME:"TOP LANCHONETE",
  PIX_CIDADE:"SAOPAULO",
  PIX_DESC:"PEDIDO",
  LOJA_COORD:{lat:-23.55052,lng:-46.633308},
  PRECO_KM:2,
  MIN_ENTREGA:5
}

function render(){
let menu=document.getElementById("menu")
menu.innerHTML=""

produtos.forEach((p,i)=>{
menu.innerHTML+=`
<div class="card">
<img src="${p.img}">
<h3>${p.nome}</h3>
<p>R$ ${p.preco}</p>
<button onclick="add(${i})">Adicionar</button>
</div>`
})
}

function login(){
let cpf=document.getElementById("cpf").value
let nome=document.getElementById("nome").value

cpf=mascaraCPF(cpf)
if(!validaCPF(cpf)){alert("CPF inválido");return}
if(!nome){alert("Informe seu nome");return}

cliente={cpf,nome}
localStorage.setItem("cliente",JSON.stringify(cliente))

alert("Login realizado")
}

function add(i){
carrinho.push(produtos[i])
updateCart()
}

function updateCart(){
document.getElementById("cartCount").innerText=carrinho.length

let itens=document.getElementById("cartItems")
itens.innerHTML=""

let total=0

carrinho.forEach(p=>{
itens.innerHTML+=`<p>${p.nome} - R$ ${p.preco}</p>`
total+=p.preco
})

document.getElementById("total").innerText=total
recalcularEntrega()
}

function abrirCarrinho(){
document.getElementById("cart").classList.toggle("hidden")
}

function gerarPix(total){
  function tlv(id,val){const len=String(val.length).padStart(2,'0');return id+len+val}
  function crc16(str){
    let crc=0xFFFF
    for(let i=0;i<str.length;i++){
      crc^=str.charCodeAt(i)<<8
      for(let j=0;j<8;j++){
        if(crc&0x8000) crc=(crc<<1)^0x1021
        else crc=crc<<1
        crc&=0xFFFF
      }
    }
    return crc.toString(16).toUpperCase().padStart(4,'0')
  }
  const gui=tlv('00','BR.GOV.BCB.PIX')
  const key=tlv('01',CONFIG.PIX_CHAVE||'')
  const desc=CONFIG.PIX_DESC? tlv('02',CONFIG.PIX_DESC) : ''
  const mai=tlv('26',gui+key+desc)
  const payload= tlv('00','01') + tlv('01','12') + mai + tlv('52','0000') + tlv('53','986') + tlv('54',Number(total).toFixed(2)) + tlv('58','BR') + tlv('59',(CONFIG.PIX_NOME||'').slice(0,25)) + tlv('60',(CONFIG.PIX_CIDADE||'').slice(0,15)) + tlv('62',tlv('05','***'))
  const toCrc= payload + '6304' + '0000'
  const crc= crc16(toCrc)
  const full= payload + '6304' + crc
  const qr="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data="+encodeURIComponent(full)
  return qr
}

function finalizar(){

let total=document.getElementById("total").innerText
let pagamento=document.getElementById("payment").value
let tipoEntrega=document.getElementById("deliveryType").value
let endereco=document.getElementById("address").value||""

let pedidos=JSON.parse(localStorage.getItem("pedidos")||"[]")

let pedido={
id: Date.now().toString(36)+Math.random().toString(36).slice(2,7),
cliente,
itens:carrinho,
total:Number(total),
taxaEntrega,
grandTotal: grandTotal || Number(total)+taxaEntrega,
tipoEntrega,
endereco,
pagamento,
status:"Recebido",
criadoEm:new Date().toISOString()
}

pedidos.push(pedido)

localStorage.setItem("pedidos",JSON.stringify(pedidos))

if(pagamento=="pix"){
let qr=gerarPix(total)
window.open(qr)
}

alert("Pedido enviado")

carrinho=[]
updateCart()

}

function enviarWhatsApp(){
  let tipoEntrega=document.getElementById("deliveryType").value
  let endereco=document.getElementById("address").value||""
  let pagamento=document.getElementById("payment").value
  let total=document.getElementById("total").innerText
  let texto=`Pedido - ${CONFIG.PIX_NOME}\nCliente: ${cliente?cliente.nome:""}\nCPF: ${cliente?cliente.cpf:""}\nItens:\n${carrinho.map(i=>`- ${i.nome} (R$ ${i.preco})`).join("\n")}\nSubtotal: R$ ${total}\nEntrega: ${tipoEntrega=="entrega"?`R$ ${taxaEntrega} - ${endereco}`:"Retirada"}\nTotal: R$ ${(Number(total)+taxaEntrega).toFixed(2)}\nPagamento: ${pagamento.toUpperCase()}`
  let url=`https://wa.me/${CONFIG.WHATSAPP_PHONE}?text=${encodeURIComponent(texto)}`
  window.open(url,"_blank")
}

function mascaraCPF(v){
  v=v.replace(/\D/g,"")
  v=v.replace(/(\d{3})(\d)/,"$1.$2")
  v=v.replace(/(\d{3})(\d)/,"$1.$2")
  v=v.replace(/(\d{3})(\d{1,2})$/,"$1-$2")
  return v
}

function validaCPF(cpf){
  cpf=cpf.replace(/[^\d]+/g,'')
  if(cpf.length!==11 || /^(\d)\1+$/.test(cpf)) return false
  let soma=0; for(let i=0;i<9;i++) soma+=parseInt(cpf.charAt(i))*(10-i)
  let resto=(soma*10)%11; if(resto===10||resto===11) resto=0; if(resto!==parseInt(cpf.charAt(9))) return false
  soma=0; for(let i=0;i<10;i++) soma+=parseInt(cpf.charAt(i))*(11-i)
  resto=(soma*10)%11; if(resto===10||resto===11) resto=0; if(resto!==parseInt(cpf.charAt(10))) return false
  return true
}

function haversine(lat1,lon1,lat2,lon2){
  const toRad=d=>d*Math.PI/180
  const R=6371
  const dLat=toRad(lat2-lat1)
  const dLon=toRad(lon2-lon1)
  const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2
  const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
  return R*c
}

function obterLocalCliente(cb){
  if(!navigator.geolocation){cb(null);return}
  navigator.geolocation.getCurrentPosition(pos=>{
    cb({lat:pos.coords.latitude,lng:pos.coords.longitude})
  },()=>cb(null),{enableHighAccuracy:true,timeout:5000})
}

function recalcularEntrega(){
  const tipo=document.getElementById("deliveryType").value
  const total=Number(document.getElementById("total").innerText)||0
  const feeRow=document.getElementById("deliveryFeeRow")
  const grandRow=document.getElementById("grandTotalRow")
  const addressRow=document.getElementById("addressRow")
  const mapEl=document.getElementById("map")
  if(tipo==="entrega"){
    addressRow.classList.remove("hidden")
    mapEl.classList.remove("hidden"); initMap()
    if(clienteCoord){
      calcularTaxaPorRota(clienteCoord).then(dist=>{
        taxaEntrega=Math.max(CONFIG.MIN_ENTREGA, Math.round(dist*CONFIG.PRECO_KM*100)/100)
        grandTotal=total+taxaEntrega
        document.getElementById("deliveryFee").innerText=taxaEntrega.toFixed(2)
        document.getElementById("grandTotal").innerText=grandTotal.toFixed(2)
        feeRow.classList.remove("hidden")
        grandRow.classList.remove("hidden")
      }).catch(()=>{
        const dist=haversine(clienteCoord.lat,clienteCoord.lng,CONFIG.LOJA_COORD.lat,CONFIG.LOJA_COORD.lng)
        taxaEntrega=Math.max(CONFIG.MIN_ENTREGA, Math.round(dist*CONFIG.PRECO_KM*100)/100)
        grandTotal=total+taxaEntrega
        document.getElementById("deliveryFee").innerText=taxaEntrega.toFixed(2)
        document.getElementById("grandTotal").innerText=grandTotal.toFixed(2)
        feeRow.classList.remove("hidden")
        grandRow.classList.remove("hidden")
      })
    }else{
      obterLocalCliente(coord=>{
        if(coord){
          clienteCoord=coord; atualizarMapa()
          calcularTaxaPorRota(coord).then(dist=>{
            taxaEntrega=Math.max(CONFIG.MIN_ENTREGA, Math.round(dist*CONFIG.PRECO_KM*100)/100)
            grandTotal=total+taxaEntrega
            document.getElementById("deliveryFee").innerText=taxaEntrega.toFixed(2)
            document.getElementById("grandTotal").innerText=grandTotal.toFixed(2)
            feeRow.classList.remove("hidden")
            grandRow.classList.remove("hidden")
          }).catch(()=>{
            const dist=haversine(coord.lat,coord.lng,CONFIG.LOJA_COORD.lat,CONFIG.LOJA_COORD.lng)
            taxaEntrega=Math.max(CONFIG.MIN_ENTREGA, Math.round(dist*CONFIG.PRECO_KM*100)/100)
            grandTotal=total+taxaEntrega
            document.getElementById("deliveryFee").innerText=taxaEntrega.toFixed(2)
            document.getElementById("grandTotal").innerText=grandTotal.toFixed(2)
            feeRow.classList.remove("hidden")
            grandRow.classList.remove("hidden")
          })
        }else{
          taxaEntrega=CONFIG.MIN_ENTREGA
        }
        grandTotal=total+taxaEntrega
        document.getElementById("deliveryFee").innerText=taxaEntrega.toFixed(2)
        document.getElementById("grandTotal").innerText=grandTotal.toFixed(2)
        feeRow.classList.remove("hidden")
        grandRow.classList.remove("hidden")
      })
      return
    }
    grandTotal=total+taxaEntrega
    document.getElementById("deliveryFee").innerText=taxaEntrega.toFixed(2)
    document.getElementById("grandTotal").innerText=grandTotal.toFixed(2)
    feeRow.classList.remove("hidden")
    grandRow.classList.remove("hidden")
  }else{
    addressRow.classList.add("hidden")
    mapEl.classList.add("hidden")
    taxaEntrega=0
    grandTotal=total
    feeRow.classList.add("hidden")
    grandRow.classList.add("hidden")
  }
}

document.getElementById("deliveryType").addEventListener("change",recalcularEntrega)
const cpfInput=document.getElementById("cpf")
cpfInput.addEventListener("input",()=>{cpfInput.value=mascaraCPF(cpfInput.value)})
try{
  const saved=localStorage.getItem("cliente"); if(saved){cliente=JSON.parse(saved)}
}catch(e){}

render()

let map=null, lojaMarker=null, clienteMarker=null, clienteCoord=null
function initMap(){
  const el=document.getElementById('map')
  if(!window.L||!el) return
  if(!map){
    map=L.map('map').setView([CONFIG.LOJA_COORD.lat,CONFIG.LOJA_COORD.lng],13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:''}).addTo(map)
    lojaMarker=L.marker([CONFIG.LOJA_COORD.lat,CONFIG.LOJA_COORD.lng]).addTo(map)
  }
}
function atualizarMapa(){
  if(!map||!clienteCoord) return
  if(!clienteMarker){
    clienteMarker=L.marker([clienteCoord.lat,clienteCoord.lng]).addTo(map)
  }else{
    clienteMarker.setLatLng([clienteCoord.lat,clienteCoord.lng])
  }
  map.fitBounds([ [CONFIG.LOJA_COORD.lat,CONFIG.LOJA_COORD.lng],[clienteCoord.lat,clienteCoord.lng] ],{padding:[20,20]})
}
async function geocodeAddress(){
  const addr=document.getElementById('address').value
  if(!addr) return
  try{
    const r=await fetch('https://nominatim.openstreetmap.org/search?format=json&q='+encodeURIComponent(addr),{headers:{'Accept':'application/json'}})
    const j=await r.json()
    if(j&&j.length){
      clienteCoord={lat:parseFloat(j[0].lat),lng:parseFloat(j[0].lon)}
      atualizarMapa()
      recalcularEntrega()
      const msg=document.getElementById('addressMsg'); msg.classList.add('hidden'); msg.innerText=''
    }else{
      const msg=document.getElementById('addressMsg'); msg.classList.remove('hidden'); msg.innerText='Endereço não encontrado. Usando taxa mínima.'
      clienteCoord=null
      taxaEntrega=CONFIG.MIN_ENTREGA
      recalcularEntrega()
    }
  }catch(e){}
}
const addrInput=document.getElementById('address')
addrInput.addEventListener('change',geocodeAddress)
addrInput.addEventListener('blur',geocodeAddress)

async function calcularTaxaPorRota(coord){
  const url=`https://router.project-osrm.org/route/v1/driving/${coord.lng},${coord.lat};${CONFIG.LOJA_COORD.lng},${CONFIG.LOJA_COORD.lat}?overview=false`
  const r=await fetch(url)
  const j=await r.json()
  if(j&&j.routes&&j.routes.length){
    return j.routes[0].distance/1000
  }else{
    throw new Error('no route')
  }
}
