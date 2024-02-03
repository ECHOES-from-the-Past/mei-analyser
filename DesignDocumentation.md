# Terminologies in the MEI analyser

- MEI file: usually the name of the file, passing as a URL object
```js
// from utility/utils.js
const objectURL = URL.createObjectURL(uploaded_file);
const newContent = await load_MEI_file(objectURL, slot);
```

- MEI Content: the content of the MEI file, parsed via `fetch`
```js
// from utility/utils.js
let mei_content;
await fetch(file_name)
.then((response) => response.text())
.then((mei) => {
    mei_content = mei;
})
return mei_content;
```

# Highlighting functions
- 