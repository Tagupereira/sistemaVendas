export function startLoading(
    button,
    texto = 'Carregando...'
){

     document.body.classList.add(
        'overflow-hidden'
    );

    button.disabled = true;

    button.dataset.originalText =
        button.innerHTML;

    button.innerHTML = `
        <div class="flex items-center justify-center gap-2">

            <div
                class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin">
            </div>

            <span>${texto}</span>

        </div>
    `;

}

export function stopLoading(button){

    document.body.classList.remove(
        'overflow-hidden'
    );
    button.disabled = false;

    button.innerHTML =
        button.dataset.originalText;

}

export function showLoading(){

    document.body.classList.add(
        'overflow-hidden'
    );

    document
        .getElementById('loadingOverlay')
        .classList.remove('hidden');

}

export function hideLoading(){

    document.body.classList.remove(
        'overflow-hidden'
    );

    document
        .getElementById('loadingOverlay')
        .classList.add('hidden');

}