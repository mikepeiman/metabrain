<script lang="ts">
    import { Badge } from '$lib/components/ui/badge/index.js';
    import { Button } from '$lib/components/ui/button/index.js';
    import * as Card from '$lib/components/ui/card/index.js';
    import { Progress } from '$lib/components/ui/progress/index.js';
    import * as Table from '$lib/components/ui/table/index.js';
    import * as Tabs from '$lib/components/ui/tabs/index.js';

    // Dummy data
    const cashflowData = {
        income: 5000,
        expenses: 3500,
        savings: 1500,
        savingsGoal: 2000
    };

    const recentNotes = [
        { id: 1, title: 'Project Ideas', date: '2023-07-01' },
        { id: 2, title: 'Meeting Notes', date: '2023-06-30' },
        { id: 3, title: 'Book Summary', date: '2023-06-29' }
    ];

    const recentWorkouts = [
        { id: 1, type: 'Cardio', duration: '30 min', date: '2023-07-01' },
        { id: 2, type: 'Strength', duration: '45 min', date: '2023-06-30' },
        { id: 3, type: 'Yoga', duration: '60 min', date: '2023-06-29' }
    ];

    const sleepData = [
        { date: '2023-07-01', duration: 7.5, quality: 'Good', supplements: ['Magnesium', 'Melatonin'] },
        { date: '2023-06-30', duration: 6.5, quality: 'Fair', supplements: ['Magnesium'] },
        { date: '2023-06-29', duration: 8, quality: 'Excellent', supplements: ['Magnesium', 'Melatonin'] }
    ];

    const topTasks = [
        { id: 1, title: 'Complete project proposal', status: 'In Progress' },
        { id: 2, title: 'Review quarterly report', status: 'To Do' },
        { id: 3, title: 'Prepare presentation', status: 'In Progress' }
    ];
</script>

<main class="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
    <!-- Cashflow -->
    <Card.Root>
        <Card.Header>
            <Card.Title>Personal Cashflow</Card.Title>
        </Card.Header>
        <Card.Content>
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span>Income</span>
                    <span>${cashflowData.income}</span>
                </div>
                <div class="flex justify-between">
                    <span>Expenses</span>
                    <span>${cashflowData.expenses}</span>
                </div>
                <div class="flex justify-between font-bold">
                    <span>Savings</span>
                    <span>${cashflowData.savings}</span>
                </div>
                <Progress value={(cashflowData.savings / cashflowData.savingsGoal) * 100} />
                <div class="text-sm text-muted-foreground">
                    ${cashflowData.savings} / ${cashflowData.savingsGoal} savings goal
                </div>
            </div>
        </Card.Content>
    </Card.Root>

    <!-- Recent Notes -->
    <Card.Root>
        <Card.Header>
            <Card.Title>Recent Notes</Card.Title>
        </Card.Header>
        <Card.Content>
            <ul class="space-y-2">
                {#each recentNotes as note}
                    <li class="flex justify-between">
                        <span>{note.title}</span>
                        <span class="text-sm text-muted-foreground">{note.date}</span>
                    </li>
                {/each}
            </ul>
        </Card.Content>
    </Card.Root>

    <!-- Recent Workouts -->
    <Card.Root>
        <Card.Header>
            <Card.Title>Recent Workouts</Card.Title>
        </Card.Header>
        <Card.Content>
            <ul class="space-y-2">
                {#each recentWorkouts as workout}
                    <li class="flex justify-between">
                        <span>{workout.type} - {workout.duration}</span>
                        <span class="text-sm text-muted-foreground">{workout.date}</span>
                    </li>
                {/each}
            </ul>
        </Card.Content>
    </Card.Root>

    <!-- Sleep Tracking -->
    <Card.Root class="col-span-full md:col-span-2">
        <Card.Header>
            <Card.Title>Sleep Tracking</Card.Title>
        </Card.Header>
        <Card.Content>
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Date</Table.Head>
                        <Table.Head>Duration</Table.Head>
                        <Table.Head>Quality</Table.Head>
                        <Table.Head>Supplements</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each sleepData as sleep}
                        <Table.Row>
                            <Table.Cell>{sleep.date}</Table.Cell>
                            <Table.Cell>{sleep.duration} hours</Table.Cell>
                            <Table.Cell>{sleep.quality}</Table.Cell>
                            <Table.Cell>
                                {#each sleep.supplements as supplement}
                                    <Badge variant="secondary" class="mr-1">{supplement}</Badge>
                                {/each}
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        </Card.Content>
    </Card.Root>

    <!-- Top Tasks and Projects -->
    <Card.Root class="col-span-full">
        <Card.Header>
            <Card.Title>Top Tasks and Projects</Card.Title>
        </Card.Header>
        <Card.Content>
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.Head>Task</Table.Head>
                        <Table.Head>Status</Table.Head>
                        <Table.Head>Action</Table.Head>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {#each topTasks as task}
                        <Table.Row>
                            <Table.Cell>{task.title}</Table.Cell>
                            <Table.Cell>
                                <Badge variant={task.status === 'In Progress' ? 'default' : 'secondary'}>
                                    {task.status}
                                </Badge>
                            </Table.Cell>
                            <Table.Cell>
                                <Button variant="outline" size="sm">Update</Button>
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Body>
            </Table.Root>
        </Card.Content>
    </Card.Root>
</main>