<script lang="ts">
	import type { PageServerData } from './$types';
	import '$lib/main.css';
	import 'highlight.js/styles/default.css';

	export let data: PageServerData;
	const { content, toc } = data;
</script>

<div class="doc">
	<nav class="doc-toc">
		<div class="doc-toc-header">Contents</div>
		{@html toc}
	</nav>

	<div class="doc-content">
		{@html content}
	</div>
</div>
