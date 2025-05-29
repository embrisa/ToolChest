/**
 * Interactive Components JavaScript
 * Functionality for interactive UI components including forms, dropzones, and search
 * 
 * Components included:
 * - DropZone: Drag & drop file upload with validation and preview
 * - SearchInput: Live search with keyboard navigation and HTMX integration
 * - FormField: Form validation, auto-resize textareas, and interactive features
 * - PasswordToggle: Show/hide password functionality
 * - CommandSearch: Global search modal with keyboard shortcuts
 */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all interactive components
    initializeDropzones();
    initializeSearchInputs();
    initializeFormFields();
    initializePasswordToggles();
});

/**
 * DropZone Component Functionality
 */
function initializeDropzones() {
    const dropzones = document.querySelectorAll('.dropzone');

    dropzones.forEach(dropzone => {
        const fileInput = dropzone.querySelector('.dropzone-input');
        const content = dropzone.querySelector('.dropzone-content');
        const states = {
            default: dropzone.querySelector('.dropzone-default-state'),
            dragover: dropzone.querySelector('.dropzone-dragover-state'),
            processing: dropzone.querySelector('.dropzone-processing-state'),
            success: dropzone.querySelector('.dropzone-success-state'),
            error: dropzone.querySelector('.dropzone-error-state')
        };
        const previewArea = dropzone.querySelector('.dropzone-preview-area');
        const previewList = dropzone.querySelector('.dropzone-preview-list');

        if (!fileInput || !content) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => highlight(dropzone, states), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => unhighlight(dropzone, states), false);
        });

        // Handle dropped files
        dropzone.addEventListener('drop', handleDrop, false);

        // Handle file input change
        fileInput.addEventListener('change', handleFiles);

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function highlight(element, states) {
            if (states.default) states.default.style.display = 'none';
            if (states.dragover) states.dragover.style.display = 'flex';
            element.classList.add('dropzone-dragover');
        }

        function unhighlight(element, states) {
            if (states.default) states.default.style.display = 'flex';
            if (states.dragover) states.dragover.style.display = 'none';
            element.classList.remove('dropzone-dragover');
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            fileInput.files = files;
            handleFiles.call(fileInput);
        }

        function handleFiles() {
            const files = Array.from(this.files);
            const maxFiles = parseInt(dropzone.dataset.dropzoneMaxFiles) || 1;
            const maxSize = dropzone.dataset.dropzoneMaxSize || '10MB';
            const accept = dropzone.dataset.dropzoneAccept || '';
            const preview = dropzone.dataset.dropzonePreview === 'true';
            const autoUpload = dropzone.dataset.dropzoneAutoUpload === 'true';

            // Validate files
            const validation = validateFiles(files, { maxFiles, maxSize, accept });
            if (!validation.valid) {
                showError(states, validation.error);
                return;
            }

            // Show files
            if (preview && previewArea && previewList) {
                showFilePreview(files, previewArea, previewList);
            }

            // Auto upload if configured
            if (autoUpload) {
                uploadFiles(files, dropzone, states);
            } else {
                showSuccess(states, `${files.length} file${files.length > 1 ? 's' : ''} selected`);
            }

            // Trigger custom callback if provided
            const onDropCallback = dropzone.dataset.dropzoneOnDrop;
            if (onDropCallback && window[onDropCallback]) {
                window[onDropCallback](files, dropzone);
            }
        }

        function validateFiles(files, options) {
            if (files.length > options.maxFiles) {
                return { valid: false, error: `Maximum ${options.maxFiles} files allowed` };
            }

            const maxSizeBytes = parseSize(options.maxSize);
            const acceptTypes = options.accept.split(',').map(t => t.trim());

            for (let file of files) {
                if (file.size > maxSizeBytes) {
                    return { valid: false, error: `File "${file.name}" exceeds maximum size of ${options.maxSize}` };
                }

                if (acceptTypes.length && acceptTypes[0] !== '') {
                    const matchesType = acceptTypes.some(type => {
                        if (type.startsWith('.')) {
                            return file.name.toLowerCase().endsWith(type.toLowerCase());
                        } else if (type.includes('/*')) {
                            return file.type.startsWith(type.split('/')[0]);
                        } else {
                            return file.type === type;
                        }
                    });

                    if (!matchesType) {
                        return { valid: false, error: `File "${file.name}" is not an accepted file type` };
                    }
                }
            }

            return { valid: true };
        }

        function parseSize(sizeStr) {
            const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
            const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/i);
            if (!match) return Infinity;
            return parseFloat(match[1]) * units[match[2].toUpperCase()];
        }

        function showFilePreview(files, previewArea, previewList) {
            previewList.innerHTML = '';

            files.forEach((file, index) => {
                const preview = createFilePreview(file, index);
                previewList.appendChild(preview);
            });

            previewArea.style.display = 'block';
        }

        function createFilePreview(file, index) {
            const preview = document.createElement('div');
            preview.className = 'file-preview-item';
            preview.innerHTML = `
                <div class="file-preview-icon">
                    <i class="fas ${getFileIcon(file.type)}"></i>
                </div>
                <div class="file-preview-info">
                    <div class="file-preview-name">${file.name}</div>
                    <div class="file-preview-size">${formatFileSize(file.size)}</div>
                </div>
                <button type="button" class="file-preview-remove" onclick="removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            return preview;
        }

        function getFileIcon(mimeType) {
            if (mimeType.startsWith('image/')) return 'fa-image';
            if (mimeType.startsWith('video/')) return 'fa-video';
            if (mimeType.startsWith('audio/')) return 'fa-music';
            if (mimeType.includes('pdf')) return 'fa-file-pdf';
            if (mimeType.includes('word')) return 'fa-file-word';
            if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fa-file-excel';
            if (mimeType.includes('zip') || mimeType.includes('archive')) return 'fa-file-archive';
            return 'fa-file';
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function showProcessing(states) {
            hideAllStates(states);
            if (states.processing) states.processing.style.display = 'flex';
        }

        function showSuccess(states, message) {
            hideAllStates(states);
            if (states.success) {
                states.success.style.display = 'flex';
                const subtitle = states.success.querySelector('.dropzone-subtitle');
                if (subtitle && message) subtitle.textContent = message;
            }
        }

        function showError(states, message) {
            hideAllStates(states);
            if (states.error) {
                states.error.style.display = 'flex';
                const errorMsg = states.error.querySelector('.dropzone-error-message');
                if (errorMsg && message) errorMsg.textContent = message;
            }
        }

        function hideAllStates(states) {
            Object.values(states).forEach(state => {
                if (state) state.style.display = 'none';
            });
        }

        function uploadFiles(files, dropzone, states) {
            showProcessing(states);

            // Simulate upload progress
            const progressFill = dropzone.querySelector('.dropzone-progress-fill');
            if (progressFill) {
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 30;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        setTimeout(() => {
                            showSuccess(states, 'Upload completed successfully!');
                        }, 500);
                    }
                    progressFill.style.width = progress + '%';
                }, 200);
            }
        }
    });
}

// Global function to clear dropzone files
window.clearDropzoneFiles = function (dropzoneId) {
    const dropzone = document.getElementById(dropzoneId);
    if (!dropzone) return;

    const fileInput = dropzone.querySelector('.dropzone-input');
    const previewArea = dropzone.querySelector('.dropzone-preview-area');
    const states = {
        default: dropzone.querySelector('.dropzone-default-state'),
        success: dropzone.querySelector('.dropzone-success-state'),
        error: dropzone.querySelector('.dropzone-error-state')
    };

    if (fileInput) fileInput.value = '';
    if (previewArea) previewArea.style.display = 'none';

    // Reset to default state
    Object.values(states).forEach(state => {
        if (state) state.style.display = 'none';
    });
    if (states.default) states.default.style.display = 'flex';
};

/**
 * SearchInput Component Functionality
 */
function initializeSearchInputs() {
    const searchContainers = document.querySelectorAll('.search-input-container');

    searchContainers.forEach(container => {
        const input = container.querySelector('.search-input-field');
        const clearButton = container.querySelector('.search-input-clear');
        const resultsDropdown = container.querySelector('.search-results-dropdown');

        if (!input) return;

        // Show/hide clear button based on input value
        input.addEventListener('input', function () {
            if (clearButton) {
                clearButton.style.display = this.value ? 'block' : 'none';
            }
        });

        // Handle keyboard navigation in results
        input.addEventListener('keydown', function (e) {
            if (resultsDropdown && resultsDropdown.style.display !== 'none') {
                handleSearchKeydown(e, container.id);
            }
        });

        // Hide results when clicking outside
        document.addEventListener('click', function (e) {
            if (!container.contains(e.target) && resultsDropdown) {
                resultsDropdown.style.display = 'none';
            }
        });
    });
}

// Global functions for search interactions
window.handleSearchFocus = function (searchId) {
    const container = document.getElementById(searchId);
    if (!container) return;

    container.classList.add('search-input-focused');

    const resultsDropdown = container.querySelector('.search-results-dropdown');
    const input = container.querySelector('.search-input-field');

    if (resultsDropdown && input && input.value) {
        resultsDropdown.style.display = 'block';
    }
};

window.handleSearchBlur = function (searchId) {
    const container = document.getElementById(searchId);
    if (!container) return;

    // Delay to allow for result clicks
    setTimeout(() => {
        container.classList.remove('search-input-focused');
        const resultsDropdown = container.querySelector('.search-results-dropdown');
        if (resultsDropdown) {
            resultsDropdown.style.display = 'none';
        }
    }, 200);
};

window.handleSearchKeydown = function (event, searchId) {
    const container = document.getElementById(searchId);
    if (!container) return;

    const resultsDropdown = container.querySelector('.search-results-dropdown');
    const items = resultsDropdown?.querySelectorAll('.search-results-item:not(.search-results-loading-item):not(.search-results-empty-item)');

    if (!items || items.length === 0) return;

    const currentIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            selectResultItem(items, nextIndex);
            break;

        case 'ArrowUp':
            event.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            selectResultItem(items, prevIndex);
            break;

        case 'Enter':
            event.preventDefault();
            if (currentIndex >= 0) {
                items[currentIndex].click();
            }
            break;

        case 'Escape':
            event.preventDefault();
            resultsDropdown.style.display = 'none';
            break;
    }
};

function selectResultItem(items, index) {
    items.forEach((item, i) => {
        item.classList.toggle('selected', i === index);
    });
}

window.clearSearchInput = function (searchId) {
    const container = document.getElementById(searchId);
    if (!container) return;

    const input = container.querySelector('.search-input-field');
    const clearButton = container.querySelector('.search-input-clear');
    const resultsDropdown = container.querySelector('.search-results-dropdown');

    if (input) {
        input.value = '';
        input.focus();

        // Trigger input event to update HTMX
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (clearButton) clearButton.style.display = 'none';
    if (resultsDropdown) resultsDropdown.style.display = 'none';
};

window.performSearch = function (searchId) {
    const container = document.getElementById(searchId);
    if (!container) return;

    const input = container.querySelector('.search-input-field');
    if (input) {
        // Trigger search event
        input.dispatchEvent(new Event('search', { bubbles: true }));
    }
};

/**
 * FormField Component Functionality
 */
function initializeFormFields() {
    // Auto-resize textareas
    const autoResizeTextareas = document.querySelectorAll('.form-textarea-auto-resize');
    autoResizeTextareas.forEach(textarea => {
        autoResize(textarea);
        textarea.addEventListener('input', () => autoResize(textarea));
    });

    // Real-time validation
    const formFields = document.querySelectorAll('.form-field-container');
    formFields.forEach(container => {
        const input = container.querySelector('input, textarea, select');
        if (!input) return;

        input.addEventListener('blur', () => validateField(container, input));
        input.addEventListener('input', () => {
            if (container.classList.contains('form-field-error')) {
                validateField(container, input);
            }
        });
    });
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function validateField(container, input) {
    const errorText = container.querySelector('.form-error-text');
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required';
    }

    // Email validation
    if (input.type === 'email' && input.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }

    // Update UI
    container.classList.toggle('form-field-error', !isValid);
    input.classList.toggle('form-input-error', !isValid);
    input.classList.toggle('form-textarea-error', !isValid);
    input.classList.toggle('form-select-error', !isValid);

    if (errorText) {
        if (!isValid) {
            errorText.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
            errorText.style.display = 'flex';
        } else {
            errorText.style.display = 'none';
        }
    }

    return isValid;
}

/**
 * Password Toggle Functionality
 */
function initializePasswordToggles() {
    const passwordWrappers = document.querySelectorAll('.form-password-wrapper[data-show-toggle="true"]');

    passwordWrappers.forEach(wrapper => {
        const toggle = wrapper.querySelector('.form-password-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const input = wrapper.querySelector('input[type="password"], input[type="text"]');
                if (input) {
                    togglePasswordVisibility(input.name);
                }
            });
        }
    });
}

window.togglePasswordVisibility = function (inputName) {
    const input = document.querySelector(`input[name="${inputName}"]`);
    const wrapper = input?.closest('.form-password-wrapper');
    const toggle = wrapper?.querySelector('.form-password-toggle');

    if (!input || !toggle) return;

    const showIcon = toggle.querySelector('[data-show-icon]');
    const hideIcon = toggle.querySelector('[data-hide-icon]');

    if (input.type === 'password') {
        input.type = 'text';
        if (showIcon) showIcon.style.display = 'none';
        if (hideIcon) hideIcon.style.display = 'inline';
    } else {
        input.type = 'password';
        if (showIcon) showIcon.style.display = 'inline';
        if (hideIcon) hideIcon.style.display = 'none';
    }
};

/**
 * Command Search Modal
 */
window.showCommandSearch = function () {
    const overlay = document.querySelector('.command-search-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        const input = overlay.querySelector('.search-input-field');
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
    }
};

window.hideCommandSearch = function () {
    const overlay = document.querySelector('.command-search-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        const input = overlay.querySelector('.search-input-field');
        if (input) input.value = '';
    }
};

// Keyboard shortcut for command search (Ctrl+K or Cmd+K)
document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        showCommandSearch();
    }
});

/**
 * Utility Functions
 */

// Form validation helper
window.validateForm = function (formElement) {
    const containers = formElement.querySelectorAll('.form-field-container');
    let isValid = true;

    containers.forEach(container => {
        const input = container.querySelector('input, textarea, select');
        if (input && !validateField(container, input)) {
            isValid = false;
        }
    });

    return isValid;
};

// File removal helper
window.removeFile = function (index) {
    // This would be implemented based on specific requirements
    console.log('Remove file at index:', index);
};

// Enhanced file preview with image thumbnails
function createImagePreview(file) {
    return new Promise((resolve) => {
        if (!file.type.startsWith('image/')) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'file-preview-thumbnail';
            img.style.maxWidth = '60px';
            img.style.maxHeight = '60px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            resolve(img);
        };
        reader.readAsDataURL(file);
    });
} 