export function toast(
    mensagem,
    tipo = 'success'
){

    const toast = document.createElement('div');

    const cores = {

        success: 'bg-green-500',

        error: 'bg-red-500',

        warning: 'bg-yellow-500',

        info: 'bg-blue-500'

    };

    toast.className = `
        fixed
        top-5
        right-5
        z-50
        px-5
        py-3
        rounded-xl
        text-white
        shadow-lg
        transition-all
        duration-300
        translate-x-full
        ${cores[tipo]}
    `;

    toast.textContent = mensagem;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {

        toast.classList.remove(
            'translate-x-full'
        );

    });

    setTimeout(() => {

        toast.classList.add(
            'translate-x-full'
        );

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}