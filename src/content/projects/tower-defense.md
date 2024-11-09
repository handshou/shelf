---
title: Tower defense
pubDate: 2024-11-08T16:00:00.000Z
description: Saving the earth
---

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731138717/posts/file_whzdmc.gif)

Web demo: [itch.io](http://handshou.itch.io/tree-of-life)

I started this project in October 2021, and finished on November 30, 2021. Together with 3 teammates who designed the beautiful art and playtested it with a small group of students weekly. Felisha worked on art and production, Yu Ling worked on our documentation and level designs, Pei Chih crafted our story and art too.

The design requirements:

* A multi-level single player game that has increasing difficulty
* Final battle/boss

Tower defense was unique to our batch and so we decided to stand out with a challenging concept. Environmental concerns were also a big theme for us, and we drew on Plants vs Zombies as an inspiration.

Time is a huge privilege during the school term, but since it was my final semester in school, I decided to sink hours into this module. Here's how the 2021 year schedule looked like: 

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731132961/posts/file_umuj0z.png)

I picked two challenges to write about. First is a path finding algorithm to enable quick level building. If the enemies could move by themselves instead of a set path, we would be done with just level design and difficulty balancing! Sounds simple, right? Right?

## Challenge 1: Path finding

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

## Challenge 2: Iteractive items

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

## Other challenges

* Game inputs
* Camera, movement, fluidity
* Producing game sprites
* Organisation of code
* Make it pretty
