// SPDX-FileCopyrightText: © 2024 Carl Ansell <github@carlansell.co.uk>
// SPDX-License-Identifier: GPL-3.0-or-later

const { registerBlockType } = wp.blocks;
const { useBlockProps, InspectorControls } = wp.blockEditor;
const { PanelBody, SelectControl, TextControl } = wp.components;
const { useSelect } = wp.data;
const { __ } = wp.i18n;

import './style.scss';
import './editor.scss';
import sources from './sources.json';

registerBlockType('carlansell94/associated-links', {
    title: __('Associated Link', 'text-domain'),
    icon: 'admin-links',
    category: 'widgets',
    attributes: {
        selectedLinkId: {
            type: 'string',
            default: '',
        },
        title: {
            type: 'string',
            default: '',
        },
        description: {
            type: 'string',
            default: '',
        },
    },
    edit: (props) => {
        const siteTitle = useSelect(() => {
            const { getSite } = wp.data.select('core');
            const title = getSite()?.title || '';
            
            // Used to correctly render HTML entities
            const textArea = document.createElement('textarea');
            textArea.innerHTML = title;
            return textArea.value;
        }, []);

        const { attributes, setAttributes } = props;
        const { selectedLinkId, title, description } = attributes;
        const blockProps = useBlockProps();

        const associatedLinksElement = document.querySelector('#post-associated-links');
        const associatedLinks = JSON.parse(associatedLinksElement.value);
        const selectedLink = associatedLinks.find(link => link.id === selectedLinkId);

        const updateSelectedLink = (id) => {
            id === '' ? setAttributes({ selectedLinkId: '' }) : setAttributes({ selectedLinkId: id });
        };

        return (
            <div {...blockProps}>
                <InspectorControls>
                    <PanelBody title={__('Associated Link Settings', 'text-domain')}>
                        <SelectControl
                            label={__('Select Link', 'text-domain')}
                            value={selectedLinkId}
                            options={[
                                {label: __('Select a link...', 'text-domain'), value: '' },
                                ...associatedLinks.map(link => ({
                                    label: `${link && link.type === 'internal' ? siteTitle
                                        : sources[link.type]?.name}: ${link.url}`,
                                    value: link.id,
                                }))
                            ]}
                            onChange={(value) => updateSelectedLink(value)}
                        />
                        <TextControl
                            label={__('Title', 'text-domain')}
                            value={title}
                            onChange={(value) => setAttributes({ title: value })}
                        />
                        <TextControl
                            label={__('Description', 'text-domain')}
                            value={description}
                            onChange={(value) => setAttributes({ description: value })}
                        />
                    </PanelBody>
                </InspectorControls>
                <div class="wp-editor-associated-link">
                    <h4>Associated Link</h4>
                    <p>Title:</p>
                    <p>{title}</p>
                    <p>Description:</p>
                    <p>{description}</p>
                    <p>Link:</p>
                    <p>{selectedLink && (selectedLink.type === 'internal' ? siteTitle +
                        ": " : sources[selectedLink.type]?.name + ": ")}{selectedLink && selectedLink.url}</p>
                </div>
            </div>
        );
    },
    save: () => {
        return null;
    },
});
