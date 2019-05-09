const shareButton = document.querySelector('#shareButton');
shareButton.addEventListener('click', () => {
    navigator.share({
        title: "Araya's playground",
        text: 'This is sample for using Web Share API',
        url: window.location.href,
    })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
});
