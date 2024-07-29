// SPDX-FileCopyrightText: © 2024 Carl Ansell <github@carlansell.co.uk>
// SPDX-License-Identifier: GPL-3.0-or-later

document.addEventListener('DOMContentLoaded', () => {
    let associatedLinks = [];
    const addAssociatedLinkButton = document.querySelector('#associated-url-add');
    const associatedLinksList = document.querySelector('#associated-links-list');
    const associatedLinksInput = document.querySelector('#post-associated-links');

    if (associatedLinksInput.value.trim()) {
        existingLinks = JSON.parse(associatedLinksInput.value.trim());
        existingLinks.forEach(link => createAssociatedLink(link.id, link.name, link.type, link.url));
    }

    function createAssociatedLink(id, name, type, url) {
        const updateAssociatedLinks = () => {
            associatedLinksInput.value = JSON.stringify(associatedLinks);
        };

        const li = document.createElement('li');
        li.dataset.type = type;

        const typeDiv = document.createElement('div');
        const linkDiv = document.createElement('div');
        typeDiv.textContent = `${name}`;
        linkDiv.classList.add('associated-link-value');
        linkDiv.textContent = `${url}`;

        const removeButtonDiv = document.createElement('div');
        removeButtonDiv.classList.add('element-remove');
        removeButtonDiv.textContent = 'x';

        removeButtonDiv.addEventListener('click', () => {
            associatedLinksList.removeChild(li);
            associatedLinks = associatedLinks.filter(savedLink => savedLink.id !== id);
            updateAssociatedLinks();
        });

        li.appendChild(typeDiv);
        li.appendChild(linkDiv);
        li.appendChild(removeButtonDiv);

        associatedLinks.push({ id, name, type, url });
        updateAssociatedLinks();

        associatedLinksList.appendChild(li);
    };

    addAssociatedLinkButton.addEventListener('click', () => {
        const urlTypeSelect = document.querySelector('#url-type');
        const urlInput = document.querySelector('#associated-url-new');
        const name = urlTypeSelect.options[urlTypeSelect.selectedIndex].dataset['name'];
        const type = urlTypeSelect.value;
        const url = urlInput.value.trim();

        if (!url) return;

        const exists = associatedLinks.some(link => link.type === type && link.url === url);
        
        if (exists) {
            alert('A matching entry already exists');
            return;
        }

        function uuid() {
            return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
                (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16))
        }

        createAssociatedLink(uuid(), name, type, url);
        urlInput.value = '';
    });
});
