const dropArea = document.getElementById('drop-area');
const gallery = document.getElementById('gallery');
let selectedFile;

// Prevent default behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight the drop area when the item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
});

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;

    handleFiles(files);
}

function handleFiles(files) {
    selectedFile = files[0];  // Store the selected file
    previewFile(selectedFile);  // Preview the selected file
}

function previewFile(file) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function() {
        let img = document.createElement('img');
        img.src = reader.result;
        gallery.innerHTML = '';  // Clear the gallery
        gallery.appendChild(img);
    }
}

function uploadSelectedFile() {
    if (!selectedFile) {
        alert('No file selected for upload.');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    }).then(response => response.json())
      .then(result => {
          console.log(result);
          // Handle the result (e.g., display the predicted emotions)
          alert('Predicted image to be : ' + JSON.stringify(result));
      })
      .catch(error => {
          console.error('Error uploading file:', error);
          alert('Error uploading file.');
      });
}
