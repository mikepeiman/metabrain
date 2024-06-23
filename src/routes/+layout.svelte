<script>
	import '../app.css';
	import { register } from '@tauri-apps/plugin-global-shortcut';
	// await register('CommandOrControl+Shift+C', (event) => {
	// 	console.log(`🚀 ~ awaitregister ~ event:`, event)
	// 	if (event.state === 'Pressed') {
	// 		console.log('Shortcut triggered');
	// 	}
	// });

	import PocketBase from 'pocketbase'

const pb = new PocketBase('http://127.0.0.1:8090')


// list and filter "example" collection records
const result = await pb.collection('notes').getList(1, 20, {
    filter: 'status = true && created > "2022-08-01 10:00:00"'
});

// authenticate as auth collection record
const userData = await pb.collection('users').authWithPassword('test@example.com', '123456');

// or as super-admin
const adminData = await pb.admins.authWithPassword('test@example.com', '123456');
</script>

<div class="flex min-h-screen w-full items-center justify-center bg-cyan-950">
	<slot></slot>
</div>

<style>
 :global(body) {
		min-height: 100vh;
	}
</style>
