
let produtos=[
{nome:"Hambúrguer Artesanal",preco:22,img:"https://images.unsplash.com/photo-1550547660-d9450f859349"},
{nome:"X-Bacon",preco:26,img:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd"},
{nome:"Batata Frita",preco:15,img:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877"}
]

let carrinho=[]
let cliente=null

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
}

function abrirCarrinho(){
document.getElementById("cart").classList.toggle("hidden")
}

function gerarPix(total){

let chave="00020126330014BR.GOV.BCB.PIX011199999999520400005303986540"+total+"5802BR5925TOP LANCHONETE6009SAOPAULO62070503***6304"

let qr="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data="+encodeURIComponent(chave)

return qr
}

function finalizar(){

let total=document.getElementById("total").innerText
let pagamento=document.getElementById("payment").value

let pedidos=JSON.parse(localStorage.getItem("pedidos")||"[]")

let pedido={
cliente,
itens:carrinho,
total,
status:"Recebido"
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

render()
