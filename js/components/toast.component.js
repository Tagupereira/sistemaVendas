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
        top-4
        left-4
        right-4
        z-50
        px-5
        py-3
        rounded-xl
        text-white
        shadow-lg
        transition-all
        duration-300
        -translate-y-full
        ${cores[tipo]}
    `;

    toast.textContent = mensagem;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {

        toast.classList.remove(
            '-translate-y-full'
        );

        toast.classList.add(
            'translate-y-0'
        );
        
    });

   setTimeout(() => {

    toast.classList.remove(
        'translate-y-0'
    );

    toast.classList.add(
        '-translate-y-full'
    );

    setTimeout(() => {

        toast.remove();

    }, 300);

}, 3000);

}