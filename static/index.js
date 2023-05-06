window.onload = init

let Relacion = []
let Conjunto = [];

function init(){
    const input1 = document.getElementById('input1');
    const inputConjunto = document.getElementById('inputConjunto')
    const btnCalcularProd = document.getElementById('btnCalcularProd')
    const btnRandom = document.getElementById('btnRandom')
    const btnClasificar = document.getElementById('btnClasificar')

    btnRandom.addEventListener('click', generarElementosRandom)
    input1.addEventListener('keyup', handdlerTecla)
    btnCalcularProd.addEventListener('click', (e)=> {
        const conjunto = checkConjunto(inputConjunto)
        obtenerProducto(conjunto)
    })
    btnClasificar.addEventListener('click', (e)=> clasificarR(checkConjunto(inputConjunto), Relacion))
    
    function handdlerTecla(e){
        const keyCode = e.keyCode, key = e.key
        const target = e.target
        const lengthConjunto = inputConjunto.children.length
        const especialKeys = [37, 39, 8]
        
        if(key.length !== 1 && !especialKeys.includes(keyCode)) return
        btnController(lengthConjunto)
        if (e.keyCode === 8){
            if(lengthConjunto === 1) return
            else return deleteUltimoElemento()
        }
        if( lengthConjunto >= 7) return;
        if(especialKeys.includes(keyCode)) return switchCasilla(keyCode, target)
        if(!elementoValido(key, target.parentNode)) return;
        else resetEstiloElemento(target)
        addElemento()
    }

    function btnController(lengthConjunto){
        if(lengthConjunto >= 4 ) btnCalcularProd.disabled = false;
        else btnCalcularProd.disabled = true;
    }

    function switchCasilla(tipo, target){
        try {
            if(tipo === 37)
                target.parentNode.previousElementSibling.firstElementChild.focus()
            else if(tipo === 39)
                target.parentNode.nextElementSibling.firstElementChild.focus()
        } catch (error) { }
    }

    function deleteUltimoElemento(){
        inputConjunto.lastElementChild.remove();
        inputConjunto.lastElementChild.firstElementChild.focus()
    }

    function addElemento(){
        const div = document.createElement('div');
        div.classList.add("w-10", "h-10", "mx-3")
        
        const input = document.createElement('input')
        input.classList.add("elemento", "w-full", "h-full", "px-2", "border-none", "outline-none", "rounded-md")
        input.maxLength = 1
        
        div.appendChild(input);
        inputConjunto.appendChild(div)
        input.focus()
        input.addEventListener('keyup', handdlerTecla)
        return input
    }

    function generarElementosRandom(){
        clearElementos()
        const  caracteres = '0123456789abcdefghijklmnopqrstuvwxyz';
        const cantElementos = Math.floor(Math.random() * 4) + 4;
        const set = new Set()
        for(let i = 0; i < cantElementos; i++ ){
            const res = caracteres.charAt(Math.floor(Math.random() * caracteres.length));
            if(set.has(res)) {
                --i;
                continue;
            } else set.add(res)
            
            if(i === 0) input1.value = res
            else {
                const input = addElemento()
                input.value = res;
            }
            
        }
        btnController(cantElementos)
    }
    function clearElementos(){
        const lengthConjunto = inputConjunto.childElementCount
        for(let i = 1; i < lengthConjunto; ++i) inputConjunto.children[1].remove()
    }
}


function checkConjunto(inputConjunto){
    console.log("verificando relacion y conjutno...")
    const conjunto = Array.from(inputConjunto.children)
    
    if(conjunto.length < 4 || conjunto.length > 7)
        return Swal.fire({icon: 'error', text:'El número de elementos debe ser de 4 a 7'})
    let elementos = []
    if(conjunto.slice(-1)[0].firstElementChild.value.trim() === "") conjunto.pop()
    for(const elemento of conjunto){
        const texto = elemento.firstElementChild.value
        if(!elementoValido(texto, elemento, true)) return;
        elementos.push(texto)
    }
    if((new Set(elementos)).size !== elementos.length) return Swal.fire({icon: 'error', text: 'No puede haber elementos repetidos'})
    return elementos
}

const resetEstiloElemento = (elemento) => elemento.classList.add('border-none') 

function elementoValido(texto, elemento, show=false){
    const error = texto.length > 1 || !esAlfanumerico(texto)

    if(error){
        const input = elemento.firstElementChild
        input.classList.add('border-2', 'border-red-700')
        input.classList.remove('border-none')

        if(!show) return false;
        if(texto.length > 1) 
            Swal.fire({icon: 'error', text:'El elemento debe de ser un solo caracter'})
        else if(!esAlfanumerico(texto))
            Swal.fire({icon: 'error', text:'El elemento debe ser un caracter alfa-numérico'})
        return false
    }
    return true
}

function esAlfanumerico(caracter) {
    let codigo = caracter.charCodeAt(0);
    if ((codigo >= 48 && codigo <= 57) || // dígitos
        (codigo >= 65 && codigo <= 90) || // letras mayúsculas
        (codigo >= 97 && codigo <= 122)) { // letras minúsculas
      return true;
    }
    return false;
}

function obtenerProducto(elementos){
    resetHasse()
    Conjunto = elementos;
    fetch('/producto', {
        method: 'POST',
        headers:{
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(elementos)
    })
    .then(req => req.json())
    .then(res => mostrarProducto(res, elementos))
}

function mostrarProducto(producto, elementos){
    const bodyTablaProd = document.getElementById('bodyTablaProd')
    const headerTablaProd = document.getElementById('headerTablaProd')

    headerTablaProd.innerHTML = '<th scope="col" class="px-6 py-4 border-r px-6 py-4 dark:border-neutral-500">#</th>'
    elementos.forEach(elemento => headerTablaProd.innerHTML+= `<th class="border-r px-6 py-4 dark:border-neutral-500">${elemento}</th>`)

    let temp = '';
    producto.forEach((fila, i) => {
        temp += `<tr class="border-b dark:border-neutral-500">
            <td class="whitespace-nowrap border-r px-6 py-4 dark:border-neutral-500">${elementos[i]}</td>`
        const clase = "whitespace-nowrap border-r px-6 py-4 dark:border-neutral-500 cursor-pointer hover:bg-teal-400"
        fila.forEach(element => temp +=`<td class="${clase}" data="${element}" onclick="seleccionar(this)">(${element})</td>`)
        temp+= '</tr>'
    });
    bodyTablaProd.innerHTML = temp
    
}

function clasificarR(conjunto, relacion){
    fetch('/clasificar', {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'r': relacion,
            conjunto
        })
    })
    .then(req => req.json())
    .then(res => {
        const cadena = res['resultado'];
        const array = cadena.slice(1, -1).split(',');
        for(const rel of array) {
            if(rel === 'Orden parcial') {
                habilitarDiagrama();
            }
        }
        Swal.fire({icon:'success', html: 'La relación es:</br>'+ array.join('</br>')})
    })
}

function resetHasse(){
    const btnDiagramaHasse = document.getElementById("btnDiagramaHasse")
    if(btnDiagramaHasse) btnDiagramaHasse.remove();
    const img = document.getElementById('hasse')
    img.src = '';
    img.parentElement.classList.add('hidden')
}

function seleccionar(target){
    target.classList.toggle('bg-teal-400')
    target.classList.toggle('selected')
    if(target.classList.contains('selected'))
        Relacion.push(target.innerHTML)
    else {
        const i = Relacion.indexOf(target.innerHTML)
        Relacion.splice(i, 1)
    }
    
    if(Relacion.length != 0) btnClasificar.classList.remove('hidden')
    else btnClasificar.classList.add('hidden')
}

function habilitarDiagrama(){
    const divBotones = document.getElementById("botones")

    const divBtnDiagramHasse = document.createElement('div')
    divBtnDiagramHasse.setAttribute('id', 'btnDiagramaHasse')
    divBtnDiagramHasse.setAttribute('class', 'flex w-full hidden')
    divBtnDiagramHasse.innerHTML = `<button class="p-2 m-auto rounded-lg bg-slate-300 text-slate-900">Diagrama de Hasse</button>`
    
    divBotones.appendChild(divBtnDiagramHasse)

    const btnDiagramaHasse = document.getElementById("btnDiagramaHasse")
    btnDiagramaHasse.addEventListener('click', () => { 
        fetch('/diagrama', {
            method: 'POST',
            headers:{   
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conjunto: Conjunto,
                relacion: Relacion
            })
        })
        .then(response => response.blob())
        .then(imagen => {
            const urlImagen = URL.createObjectURL(imagen);
            const img = document.getElementById('hasse')
            img.src = urlImagen;
            img.parentElement.classList.remove('hidden')
        })
    })
    btnDiagramaHasse.classList.remove('hidden')
}
