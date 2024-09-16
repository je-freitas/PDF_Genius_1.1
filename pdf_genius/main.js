require('dotenv').config();
import { handleFile } from './pdfHandler.js';
import { getAnswerFromAPI } from './pdfHandler.js';
import Swal from 'sweetalert2';
import { displaySearchResults, getContextAroundText } from './searchUtils.js';


let pdfText = '';

const fileInput = document.getElementById('pdf_upload');
const uploadButton = document.getElementById('uploadButton');
const resultContainer = document.getElementById('result');
const loadingMessage = document.getElementById('loadingMessage');
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const askButton = document.getElementById('askButton');
const answerOutput = document.getElementById('answerOutput');
const loadingBarContainer = document.getElementById('loadingBarContainer');
const loadingBar = document.getElementById('loadingBar');
const searchLoading = document.getElementById('searchLoading');
const searchLoadingBarContainer = document.getElementById('searchLoadingBarContainer');
const searchLoadingBar = document.getElementById('searchLoadingBar');

Swal.fire({
    title: 'Bem-vindo!',
    text: 'Estamos felizes em ter você aqui.',
    icon: 'success',
    confirmButtonText: 'Obrigado'
});

// Inicialmente desativar o botão de pesquisa
searchButton.disabled = true;

// Adicionar evento de clique no botão de upload
uploadButton.addEventListener('click', () => {
    handleFile(fileInput, {
        loadingMessage,
        loadingBarContainer,
        loadingBar,
        resultContainer,
        searchButton,
        pdfText: (text) => pdfText = text
    });
});

// Adicionar evento de clique no botão de pesquisa
searchButton.addEventListener('click', () => {
    const query = searchInput.value;
    searchPDF(query, pdfText, {
        searchLoading,
        searchLoadingBarContainer,
        searchResult: document.getElementById('searchResult')
    });
});

// Adicionar evento de clique no botão de pergunta
askButton.addEventListener('click', async () => {
    const question = searchInput.value;
    if (!pdfText) {
        Swal.fire({
            title: 'Aviso',
            text: 'Nenhum texto do PDF carregado. Por favor, faça o upload de um PDF primeiro.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
        return;
    }
    const answer = await getAnswerFromAPI(question, pdfText);
    answerOutput.textContent = answer;
});
