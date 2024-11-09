---
title: Tower defense
pubDate: 2024-11-08T16:00:00.000Z
description: Saving the earth
---

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731135291/posts/file_uy2stl.gif)

Started October, ended 30 November 2021.

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731132961/posts/file_umuj0z.png)

Code on [Github](https://github.com/treeolife/treeolife/blob/3ead2d6cc26bb5987b7482c952f26bef06e059ab/treeoflife/scripts/scr_fill_the_grid/scr_fill_the_grid.gml).

```c
function scr_fill_the_grid(start_x, start_y, goal_x, goal_y) 
    Initialize path_found to 0
    Initialize point_list and add the start coordinates to it
    Create a copy of the global pathfinding grid

    for each iteration(up to 200):
        if path is found:
            destroy point_list and grid, then exit

        if point_list is empty:
            destroy point_list and grid, return path_not_found

    for each point in point_list:
        get current point's coordinates (ax, ay)

        if current point is the goal:
            set path_found to 1, build path, and exit

        Attempt horizontal move to the right
        If blocked, attempt jump, gap jump, or big jump to the right
        If blocked further, attempt fall cases to the right

        Attempt horizontal move to the left
        If blocked, attempt jump, gap jump, or big jump to the left
        If blocked further, attempt fall cases to the left

    Clear previous points from point_list

End function

```

Code on [Github](https://github.com/treeolife/treeolife/blob/3ead2d6cc26bb5987b7482c952f26bef06e059ab/treeoflife/objects/pItem/Step_0.gml).

```c
// Function that runs inherited events and initializes a timer
Run inherited events
Initialize timer and increment by 1 each time

// Calculate sine wave for movement or transparency effect
Set sineWave to a value based on a sine function using current time and amplitude

// Check if there is interaction to process
If interactOrigin is "no one" or interactX is - 1, exit the function

// Calculate distances for movement interpolation
Calculate distanceX as the absolute difference between start position(xstart) and interaction position(interactX)
Calculate distanceLeft as the absolute difference between current x position and interactX
Set time as pickedTime divided by room_speed(used for animations or transitions)
Calculate percent as the fraction of distance covered

// If the item is not picked up
If picked is false
    Set x to floor(x)(align x position to an integer for precision)

  // If the item is picked up
Else
    Decrease image_alpha(transparency) gradually over time
    If image_alpha drops below a threshold or sine function condition met
        Set visible to false(make item invisible)
        Reset position x and y to 0

    // Apply sine wave-based movement pattern
    Move y position based on time along a sine wave

    // Move item left or right based on interaction position
    If x is to the left of interactX
        Move x position to the right by incrementing based on time
    Else
        Move x position to the left by decrementing based on time

```
