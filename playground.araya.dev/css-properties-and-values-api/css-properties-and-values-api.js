window.addEventListener('load', () => {
    if (!CSS.registerProperty) {
        alert("Your Browser doesn't support CSS Properties and Values API")
    }
    CSS.registerProperty({
        name: '--box-bg-color',
        syntax: '<color>',
        inherits: false,
        initialValue: '#000000',
    });

    CSS.registerProperty({
        name: '--box-color',
        syntax: '<color>',
        inherits: false,
        initialValue: '#FFFFFF',
    });
})

