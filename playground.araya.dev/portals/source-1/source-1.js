const nameEl = document.querySelector('#name');
alert(1);
window.portalHost.addEventListener('message', e => {
    console.log(e);
    const {name} = e.data;
    nameEl.innerHTML = name;
});
