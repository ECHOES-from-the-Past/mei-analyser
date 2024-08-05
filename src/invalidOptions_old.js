/**
* Load predefined files when DOM is loaded
*/
document.addEventListener("DOMContentLoaded", () => {
    invalidOptions();
});


window.addEventListener("change", () => {
    invalidOptions();
});


function invalidOptions() {
    if (!aquitanianCheckbox.checked && !squareCheckbox.checked) {
        clientStatus.textContent = "Please select at least one notation type";
        clientStatus.style.color = "red";
        clientStatus.hidden = false;
        searchButton.disabled = true;
        return;
    }

    let allCheckboxUnchecked = () => {
        for (let checkbox of modeCheckboxes) {
            if (checkbox.checked) {
                return false;
            }
        }
        return true;
    }
    if (allCheckboxUnchecked() && !unknownModeCheckbox.checked) {
        clientStatus.textContent = "Please select at least one mode";
        clientStatus.style.color = "red";
        clientStatus.hidden = false;
        searchButton.disabled = true;
        return;
    }

    if (!aquitanianCheckbox.checked && squareCheckbox.checked &&
        allCheckboxUnchecked() && unknownModeCheckbox.checked) {
        clientStatus.textContent = "Please select at least one mode or uncheck 'Unknown Mode'";
        clientStatus.style.color = "red";
        clientStatus.hidden = false;
        searchButton.disabled = true;
        return;
    } else {
        clientStatus.hidden = true;
        searchButton.disabled = false;
    }
}

