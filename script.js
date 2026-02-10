document.addEventListener('DOMContentLoaded', () => {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', function () {
            tabLinks.forEach(el => el.classList.remove('active'));
            tabContents.forEach(el => el.classList.remove('active'));

            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            const target = document.getElementById(tabId);

            if (target) {
                target.classList.add('active');
            }
        });
    });
});