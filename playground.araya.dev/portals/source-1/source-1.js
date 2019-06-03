const nameEl = document.querySelector('#name');
console.log('window.portalHost:', window.portalHost);
window.portalHost.addEventListener('message', e => {
    console.log(e);
    const {name} = e.data;
    nameEl.innerHTML = name;
});
