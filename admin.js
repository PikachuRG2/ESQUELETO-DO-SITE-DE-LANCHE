
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

setInterval(()=>{

let pedidos=JSON.parse(localStorage.getItem("pedidos")||"[]")

let div=document.getElementById("pedidos")
div.innerHTML=""

pedidos.forEach(p=>{
div.innerHTML+=`<p>${p.cliente.nome} - R$${p.total} - ${p.status}</p>`
})

},2000)

}
