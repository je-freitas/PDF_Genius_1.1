import Swal from 'sweetalert2';
import { displaySearchResults, getContextAroundText } from './searchUtils.js';
import pdfjsLib from 'pdfjs-dist';
import { displaySearchResults, getContextAroundText } from './searchUtils.js';


export function handleFile(fileInput, elements) {
    const file = fileInput.files[0];
    if (!file) {
        Swal.fire({
            title: 'Aviso',
            text: 'Por favor, selecione um arquivo PDF.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    if (file.type !== 'application/pdf') {
        Swal.fire({
            title: 'Aviso',
            text: 'O arquivo selecionado não é um PDF.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    const reader = new FileReader();
    reader.onload = function() {
        const pdfData = new Uint8Array(this.result);

        // Exibir mensagem de carregamento e a barra de carregamento
        elements.loadingMessage.classList.remove('hidden');
        elements.loadingBarContainer.classList.remove('hidden');
        elements.loadingBar.style.width = '0%';

        pdfjsLib.getDocument({ data: pdfData }).promise.then(pdf => {
            console.log('PDF carregado com sucesso.');
            const numPages = pdf.numPages;
            let pagePromises = [];
            let loadedPages = 0;

            // Iterar por todas as páginas
            for (let i = 1; i <= numPages; i++) {
                pagePromises.push(
                    pdf.getPage(i).then(page => {
                        return page.getTextContent().then(textContent => {
                            loadedPages++;
                            const progress = Math.round((loadedPages / numPages) * 100);
                            elements.loadingBar.style.width = `${progress}%`;
                            return textContent.items.map(item => item.str).join(' ');
                        });
                    })
                );
            }

            // Esperar que todas as promessas sejam resolvidas
            Promise.all(pagePromises).then(pagesText => {
                const pdfText = pagesText.join(' '); // Juntar o texto de todas as páginas
                console.log('Texto extraído do PDF:', pdfText);

                // Ocultar mensagem de carregamento e liberar a pesquisa
                elements.loadingMessage.classList.add('hidden');
                elements.loadingBarContainer.classList.add('hidden');
                elements.resultContainer.classList.remove('hidden');
                elements.searchButton.disabled = false; // Ativar o botão de pesquisa

                Swal.fire({
                    title: 'Sucesso',
                    text: 'Texto extraído com sucesso. Você pode fazer a pesquisa agora.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });

                elements.pdfText(pdfText);
            }).catch(error => {
                console.error('Erro ao processar o texto das páginas:', error);
                Swal.fire({
                    title: 'Erro',
                    text: 'Erro ao processar o texto das páginas. Veja o console para detalhes.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            });
        }).catch(error => {
            console.error('Erro ao carregar o PDF:', error);
            Swal.fire({
                title: 'Erro',
                text: 'Erro ao carregar o PDF. Veja o console para detalhes.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
    };

    reader.onerror = function(error) {
        console.error('Erro ao ler o arquivo:', error);
        Swal.fire({
            title: 'Erro',
            text: 'Erro ao ler o arquivo. Veja o console para detalhes.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    };

    reader.readAsArrayBuffer(file);
}

export function searchPDF(query, pdfText, elements) {
    if (!pdfText) {
        Swal.fire({
            title: 'Aviso',
            text: 'Nenhum texto do PDF carregado. Por favor, faça o upload de um PDF primeiro.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const lowerCaseText = pdfText.toLowerCase();
    const results = [];
    let index = lowerCaseText.indexOf(lowerCaseQuery);

    while (index !== -1) {
        results.push(index);
        index = lowerCaseText.indexOf(lowerCaseQuery, index + 1);
    }

    if (results.length > 0) {
        displaySearchResults(results, query, pdfText, elements);
    } else {
        elements.searchResult.innerHTML = 'Nenhum texto encontrado.';
    }
}
