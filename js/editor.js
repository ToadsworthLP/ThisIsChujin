const SCRIPT_INPUT_ELEMENT = document.getElementById("script-input");
const COPIED_MESSAGE_ELEMENT = document.getElementById("copied-message");

function generateButtonClicked() {
    let link = createShareableUrl(SCRIPT_INPUT_ELEMENT.value);
    console.log(link)
    navigator.clipboard.writeText(link);
    COPIED_MESSAGE_ELEMENT.style.display = "unset";
}