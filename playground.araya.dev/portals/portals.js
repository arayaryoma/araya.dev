window.addEventListener('load', () => {
   const portalEl = document.querySelector('#portal-1');
   portalEl.addEventListener('click', () => {
      // portalEl.activate();
      portalEl.classList.add('portal-reveal')
   })
   portalEl.addEventListener('transitionend', e => {
      if (e.propertyName === 'bottom') portalEl.activate();
   });

   const form = document.querySelector('#form');
   const nameInput = document.querySelector('#name');
   form.addEventListener('submit', e => {
      e.preventDefault();
      const name = nameInput.value;
      portalEl.postMessage({name}, 'https://playground.araya.dev/portals/source-1.html');
   })
});
