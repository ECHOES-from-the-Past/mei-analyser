import App from './src/App.svelte';

import { mount } from 'svelte';

const app = mount(App, { target: document.getElementById("app") });
export default app;