<script lang="ts">
	import DashboardMain from './DashboardMain.svelte';
	import DashboardHeader from './DashboardHeader.svelte';
	import SideMenuLeft from '$components/SideMenuLeft.svelte';
import DashboardMain2 from './DashboardMain2.svelte';
</script>

<div class="flex min-h-screen w-full flex-col bg-blue-12">
	<!-- <SideMenuLeft></SideMenuLeft> -->

	<slot><!-- optional fallback --></slot>
	<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
		<DashboardHeader></DashboardHeader>
		<!-- <DashboardMain></DashboardMain> -->
		<DashboardMain2 />
	</div>
</div>
