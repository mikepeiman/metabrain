<script lang="ts">
    import ChevronLeft from "lucide-svelte/icons/chevron-left";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    import Copy from "lucide-svelte/icons/copy";
    import CreditCard from "lucide-svelte/icons/credit-card";
    import File from "lucide-svelte/icons/file";
    import Home from "lucide-svelte/icons/home";
    import LineChart from "lucide-svelte/icons/line-chart";
    import ListFilter from "lucide-svelte/icons/list-filter";
    import EllipsisVertical from "lucide-svelte/icons/ellipsis-vertical";
    import Package from "lucide-svelte/icons/package";
    import Package2 from "lucide-svelte/icons/package-2";
    import PanelLeft from "lucide-svelte/icons/panel-left";
    import Search from "lucide-svelte/icons/search";
    import Settings from "lucide-svelte/icons/settings";
    import ShoppingCart from "lucide-svelte/icons/shopping-cart";
    import Truck from "lucide-svelte/icons/truck";
    import UsersRound from "lucide-svelte/icons/users-round";
  
    import { Badge } from "$lib/components/ui/badge/index.js";
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Pagination from "$lib/components/ui/pagination/index.js";
    import { Progress } from "$lib/components/ui/progress/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import * as Sheet from "$lib/components/ui/sheet/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
    
   import placeholderImg from "$images/placeholder.jpg";
  </script>

    <aside class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav class="flex flex-col items-center gap-4 px-2 py-4">
        <a
          href="##"
          class="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Package2 class="h-4 w-4 transition-all group-hover:scale-110" />
          <span class="sr-only">Acme Inc</span>
        </a>
        <Tooltip.Root>
          <Tooltip.Trigger asChild let:builder>
            <a
              href="##"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              use:builder.action
              {...builder}
            >
              <Home class="h-5 w-5" />
              <span class="sr-only">Dashboard</span>
            </a>
          </Tooltip.Trigger>
          <Tooltip.Content side="right">Dashboard</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger asChild let:builder>
            <a
              href="##"
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              use:builder.action
              {...builder}
            >
              <ShoppingCart class="h-5 w-5" />
              <span class="sr-only">Orders</span>
            </a>
          </Tooltip.Trigger>
          <Tooltip.Content side="right">Orders</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger asChild let:builder>
            <a
              href="##"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              use:builder.action
              {...builder}
            >
              <Package class="h-5 w-5" />
              <span class="sr-only">Products</span>
            </a>
          </Tooltip.Trigger>
          <Tooltip.Content side="right">Products</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger asChild let:builder>
            <a
              href="##"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              use:builder.action
              {...builder}
            >
              <UsersRound class="h-5 w-5" />
              <span class="sr-only">Customers</span>
            </a>
          </Tooltip.Trigger>
          <Tooltip.Content side="right">Customers</Tooltip.Content>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger asChild let:builder>
            <a
              href="##"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              use:builder.action
              {...builder}
            >
              <LineChart class="h-5 w-5" />
              <span class="sr-only">Analytics</span>
            </a>
          </Tooltip.Trigger>
          <Tooltip.Content side="right">Analytics</Tooltip.Content>
        </Tooltip.Root>
      </nav>
      <nav class="mt-auto flex flex-col items-center gap-4 px-2 py-4">
        <Tooltip.Root>
          <Tooltip.Trigger asChild let:builder>
            <a
              href="##"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              use:builder.action
              {...builder}
            >
              <Settings class="h-5 w-5" />
              <span class="sr-only">Settings</span>
            </a>
          </Tooltip.Trigger>
          <Tooltip.Content side="right">Settings</Tooltip.Content>
        </Tooltip.Root>
      </nav>
    </aside>

