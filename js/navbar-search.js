const formBuscador = document.querySelector(".buscador-wrapper")

if(formBuscador){

  formBuscador.addEventListener("submit", e => {

    e.preventDefault()

    const input = document.getElementById("buscador")
    const search = input.value.trim()

    if(search){
      window.location.href = `../pages/products.html?search=${encodeURIComponent(search)}`
    }

  })

}