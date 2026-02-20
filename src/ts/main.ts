import index from './pages/index';
import about from './pages/about';
import common from './pages/common';

document.addEventListener('DOMContentLoaded', () => {
    switch (document.body.classList.value) {
        case 'index_page':
            index();
            break;
        case 'about_page':
            about();
            break;
        case 'contact_page':
            break;
        default:
            common();
            break;
    }
})