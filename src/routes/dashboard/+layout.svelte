<script lang="ts">
	import DashboardMain from './DashboardMain.svelte';
	import DashboardHeader from './DashboardHeader.svelte';
	import SideMenuLeft from '$components/SideMenuLeft.svelte';

</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
	<SideMenuLeft></SideMenuLeft>

	<slot><!-- optional fallback --></slot>
	<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
		<DashboardHeader></DashboardHeader>
		<DashboardMain></DashboardMain>
	</div>
</div>
