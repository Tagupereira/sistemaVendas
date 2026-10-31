export function confirmar({
    titulo = 'Confirmar',
    mensagem = '',
    detalhe = '',
    textoConfirmar = 'Confirmar',
    textoCancelar = 'Cancelar',
    perigo = false
} = {}) {

    return new Promise(resolve => {

        const overlay = document.createElement('div');

        overlay.className = 'fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-5';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        overlay.innerHTML = `
            <div class="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.30)]">

                <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center ${perigo ? 'bg-red-100' : 'bg-blue-100'}">
                    <span class="material-symbols-outlined text-4xl ${perigo ? 'text-red-500' : 'text-blue-500'}">
                        ${perigo ? 'delete' : 'help'}
                    </span>
                </div>

                <h2 data-titulo class="text-xl font-bold mt-4"></h2>
                <p data-mensagem class="text-slate-700 font-medium mt-2"></p>
                <p data-detalhe class="text-sm text-slate-400 mt-2"></p>

                <div class="grid grid-cols-2 gap-3 mt-6">
                    <button data-cancelar class="rounded-xl p-3 bg-slate-200 text-slate-700 font-medium"></button>
                    <button data-confirmar class="rounded-xl p-3 text-white font-medium ${perigo ? 'bg-red-500' : 'bg-blue-500'}"></button>
                </div>

            </div>
        `;

        // textContent: nomes e textos digitados nunca viram código
        overlay.querySelector('[data-titulo]').textContent = titulo;

        const pMensagem = overlay.querySelector('[data-mensagem]');
        const pDetalhe = overlay.querySelector('[data-detalhe]');

        pMensagem.textContent = mensagem;
        pDetalhe.textContent = detalhe;

        if (!mensagem) pMensagem.classList.add('hidden');
        if (!detalhe) pDetalhe.classList.add('hidden');

        const btnCancelar = overlay.querySelector('[data-cancelar]');
        const btnConfirmar = overlay.querySelector('[data-confirmar]');

        btnCancelar.textContent = textoCancelar;
        btnConfirmar.textContent = textoConfirmar;

        function fechar(resposta) {
            document.removeEventListener('keydown', aoTeclar);
            overlay.remove();
            resolve(resposta);
        }

        function aoTeclar(e) {
            if (e.key === 'Escape') fechar(false);
        }

        btnCancelar.onclick = () => fechar(false);
        btnConfirmar.onclick = () => fechar(true);

        // tocar fora da janela = cancelar
        overlay.addEventListener('click', e => {
            if (e.target === overlay) fechar(false);
        });

        document.addEventListener('keydown', aoTeclar);

        document.body.appendChild(overlay);

        btnCancelar.focus();

    });

}