let fileCount = 1;
document.addEventListener('DOMContentLoaded', function(){
    document.querySelector('.add-input-file').addEventListener('click', function(){
        let loadFileComponent = createLoadFileComponent();
        this.before(loadFileComponent);
    })

    document.forms[0].onclick = event => {
        let target = event.target;
        if (!event.target.classList.contains('remove-input')) return;

        target.parentElement.remove();
    }
});

function createLoadFileComponent(){
    let loadFileComponent = document.createElement('div');
    let fileInput = document.createElement('input');
    let xButton = document.createElement('button');
    loadFileComponent.append(fileInput, xButton);

    loadFileComponent.classList.add('load-file');
    fileInput.classList.add('input-file');
    xButton.classList.add('remove-input');
    xButton.onclick = () => false;

    fileInput.type = 'file';
    fileInput.name = 'file' + fileCount++;

    xButton.innerHTML = 'X';

    return loadFileComponent;
}