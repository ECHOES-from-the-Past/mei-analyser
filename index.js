import App from './src/App.svelte';
import { mount } from 'svelte';
export default mount(App, { target: document.getElementById("app") });