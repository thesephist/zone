(function() {
    const idInput = document.querySelector('#id');
    const requiredMessage = document.querySelector('.requiredMessage');
    const uriInput = document.querySelector('#content_uri');
    const noteInput = document.querySelector('#content_note');

    let userTypedInput = false;

    function setPasswordGroupVisibility(displayed) {
        requiredMessage.style.display = displayed ? '' : 'none';
    }

    async function checkIfShouldShowPasswordRequired() {
        const id = idInput.value;
        if (id) {
            try {
                const locked = await fetch(`/${id}/locked`).then(resp => resp.text());
                return +locked > 0;
            } catch (e) {
                // should happen, but just in case, reveal the password field
                return true;
            }
        } else {
            return false;
        }
    }
    async function populateContentForExistingNote() {
        const id = idInput.value;
        if (id) {
            try {
                const content = await fetch(`/${id}/content`).then(resp => resp.json());
                if (content['type'] == "none") {
                    if (!userTypedInput) {
                        uriInput.value = "";
                        noteInput.value = "";
                    }
                    return;
                }

                if (userTypedInput) {
                    const replace = confirm(`Do you want to replace what you've typed with the existing content for id ${id}?`);
                    if (!replace) {
                        return;
                    }
                }

                if (content['type'] == "note") {
                    uriInput.value = "";
                    noteInput.value = content['content'];
                }
                else if (content['type'] == "uri") {
                    uriInput.value = content['content'];
                    noteInput.value = '';
                }

                userTypedInput = false;

            } catch (e) {
            }
        }
    }

    function debounce(fn, duration) {
        let timeout = undefined;
        return () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(fn, duration);
        }
    }

    setPasswordGroupVisibility(false);
    idInput.addEventListener('input', debounce(async () => {
        const [showPasswordRequired, _] = [
            await checkIfShouldShowPasswordRequired(),
            await populateContentForExistingNote(),
        ];
        setPasswordGroupVisibility(showPasswordRequired);
    }, 400));
    uriInput.addEventListener('input', () => {
        userTypedInput = uriInput.value.length > 0;
    });
    noteInput.addEventListener('input', () => {
        userTypedInput = noteInput.value.length > 0;
    });

    function expandTextarea(evt) {
        evt.preventDefault();
        const lastHeight = noteInput.getBoundingClientRect().height;
        noteInput.style.height = `${lastHeight + 150}px`;
        document.documentElement.scrollTop += 150;
    }
    document.querySelector('#expandNoteButton').addEventListener('click', expandTextarea);

})();

