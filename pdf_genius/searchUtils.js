// sirsutils.js

/**
 * Exibe os resultados da pesquisa com realce e navegação.
 * @param {number[]} results - Array de posições onde a pesquisa encontrou correspondências.
 * @param {string} query - Texto da pesquisa.
 * @param {string} pdfText - Texto extraído do PDF.
 * @param {Object} elements - Elementos DOM onde os resultados serão exibidos.
 */
export function displaySearchResults(results, query, pdfText, elements) {
    const contextLength = 150;
    let highlightedText = '';

    results.forEach((position, index) => {
        const start = Math.max(position - contextLength, 0);
        const end = Math.min(position + query.length + contextLength, pdfText.length);
        const before = pdfText.slice(start, position);
        const match = pdfText.slice(position, position + query.length);
        const after = pdfText.slice(position + query.length, end);

        highlightedText += `
            <div class="search-result" data-index="${index}">
                <span>${before}<mark>${match}</mark>${after}</span>
            </div>
        `;
    });

    function setupNavigation(totalResults) {
        const results = document.querySelectorAll('.search-result');
        let currentIndex = 0;

        function navigateTo(index) {
            if (index >= 0 && index < results.length) {
                const result = results[index];
                result.scrollIntoView({ behavior: 'smooth', block: 'center' });
                currentIndex = index;
            }
        }

        // Inicializa a navegação no primeiro resultado
        navigateTo(currentIndex);

        // Navegação com botões (se adicionados)
        document.getElementById('nextButton').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalResults;
            navigateTo(currentIndex);
        });

        document.getElementById('prevButton').addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalResults) % totalResults;
            navigateTo(currentIndex);
        });
    }

    elements.searchResult.innerHTML = highlightedText;
    setupNavigation(results.length);
}

/**
 * Obtém o contexto ao redor do texto pesquisado.
 * @param {string} text - Texto completo onde a pesquisa foi realizada.
 * @param {string} query - Texto da pesquisa.
 * @param {number} charsAround - Número de caracteres ao redor do texto pesquisado.
 * @returns {string} - Texto com a pesquisa realçada e o contexto ao redor.
 */
export function getContextAroundText(text, query, charsAround) {
    const lowerCaseText = text.toLowerCase();
    const index = lowerCaseText.indexOf(query);
    if (index === -1) return '';

    const start = Math.max(0, index - charsAround);
    const end = Math.min(text.length, index + query.length + charsAround);
    return `<span>${text.substring(start, end).replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>')}</span>`;
}
