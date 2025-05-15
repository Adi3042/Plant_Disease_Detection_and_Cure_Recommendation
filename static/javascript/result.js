const rawMarkdown = `{{ remedies | safe }}`;
const html = marked.parse(rawMarkdown);
document.getElementById('remedy-markdown').innerHTML = html;
document.addEventListener('DOMContentLoaded', function() {
    // Hide loader if it's still showing (in case page loaded completely)
    const loader = document.getElementById('loader-container');
    if (loader) {
        loader.style.display = 'none';
    }
});