function generarEstrellas(n) {
    const rating = parseFloat(n) || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHTML = "";

    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHTML += '<i class="bi bi-star-fill text-warning"></i>'; 
        } else if (i === fullStars + 1 && hasHalfStar) {
            starsHTML += '<i class="bi bi-star-half text-warning"></i>';
        } else {
            starsHTML += '<i class="bi bi-star text-muted"></i>';
        }
    }
    
    return starsHTML;
}

function renderPrecioHTML(prod) {
  if (prod.tiene_oferta) {
    return `
      <span class="precio-original">$${prod.precio_venta}</span>
      <span class="precio-oferta">$${prod.precio_final}</span>
    `;
  }

  return `<span class="precio-normal">$${prod.precio_venta}</span>`;
}

function renderBadgeHTML(prod) {
  if (!prod.tiene_oferta) return "";

  const descuento = Math.round(
    ((prod.precio_venta - prod.precio_final) / prod.precio_venta) * 100
  );

  return `
    <span class="badge bg-danger position-absolute top-0 start-0 m-2">
      -${descuento}%
    </span>
  `;
}
