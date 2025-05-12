document.getElementById('searchInput').addEventListener('input', function () {
    const filter = this.value.toLowerCase();
    const diseaseCards = document.querySelectorAll('.disease-card');

    diseaseCards.forEach(card => {
        const title = card.querySelector('h2').textContent.toLowerCase();
        if (title.includes(filter)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
});