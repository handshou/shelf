---
title: Tower defense
pubDate: 2024-11-08T16:00:00.000Z
description: Saving the earth
---

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731138717/posts/file_whzdmc.gif)

Web demo: [itch.io](http://handshou.itch.io/tree-of-life)

Tree of Life began in October 2021 and finished in eight weeks. ![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731132961/posts/file_umuj0z.png)

* I had 3 teammates,
* Felisha focused on art and game production
* Yu Ling on our level designs and writing
* Pei Chih on  story craft and a large part of art

We playtested and iterated with a small group of students weekly. All groups were doing either top-down 2 dimension games or side-scrollers, but we wanted to stand out.

So we landed on **tower defense**, in hindsight, a challenging concept. We also drew on Plants vs Zombies to highlight **environmental** concerns.

Two challenges to highlight.

## Challenge 1: Path finding

Code on [Github](https://github.com/treeolife/treeolife/blob/3ead2d6cc26bb5987b7482c952f26bef06e059ab/treeoflife/scripts/scr_fill_the_grid/scr_fill_the_grid.gml).

To carve a small scope and distribute some work (such as level designs), it was best to make drag-and-drop and no-code possible for my teammates with no coding background. In tower defense, enemies must somehow find a way to their objective. We could draw a manual path by hand, for many enemies in many levels, or we could write a pathfinding method and simplify level building!

Guess which we chose :)

It wasn't that simple, but I adopted a shortest path method which takes in 2 positions:

* Start / spawn location
* Destination / tree of life

The monsters (or rubbish creatures) will have to traverse steps and small chasms by jumping up, or jumping over, or dropping between gaps in platforms to move to their objectives.

Since our game is covered by a grid system, we can traverse grids from the top left (0,0) to the bottom right(x, y) and calculate the 8 different directions in an octagonal path around the object, and consider if the path is a solid block (pavements and steps) or not. It takes one step if unobstructed, or considers jumping or dropping if obstructed.

At the new position, we iterate this process until all paths have been calculated, or we have landed on the destination position.

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

This was my first time applying wave equations in programming. To create objects that float magically and on button press, be collected, we'll have to implement a sine-wave motion. This happens with game time and ticks, which the GameMaker engine has abstracted but leaves us to manipulate the variables for each tick.

The code looks fairly straightforward, but behind it are days and hours of testing to get it just right.

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

## Summary

First is a path finding algorithm to enable quick level building. If the enemies could move by themselves instead of a set path, we would be done with just level design and difficulty balancing! Sounds simple, right? Right?

Second, an implementation of wave functions to make delightful animations!

## Other challenges from making this

* Game inputs
* Camera, movement, fluidity
* Producing game sprites
* Organisation of code
* Saving game state - level restarts
* Make it pretty

This project brought me immense joy on completion, but there were so many nights burnt and bugs to deal with. It gave me an idea of how the gaming industry moves, under a lot of time pressure to deliver.

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731323133/posts/file_be8cfd.png)![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731323076/posts/file_zet40n.png)![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731323090/posts/file_oqmhxi.png)![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731323000/posts/file_s8nke9.png)![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731323119/posts/file_a7pfcj.png)![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731322988/posts/file_vsmmah.png)

## Other media

[Pathfinding calculations](https://res.cloudinary.com/dbifqlg1w/video/upload/v1731323969/posts/Screen_Recording_2021-11-05_at_10.26.13_AM_yc7tlr.mov "Screen_Recording_2021-11-05_at_10.26.13_AM_yc7tlr")

[User interface](https://res.cloudinary.com/dbifqlg1w/video/upload/v1731323994/posts/Screen_Recording_2021-11-03_at_11.18.03_AM_u0ubok.mov "Screen_Recording_2021-11-03_at_11.18.03_AM_u0ubok")

[Pathfinding](https://res.cloudinary.com/dbifqlg1w/video/upload/v1731324046/posts/Screen_Recording_2021-10-14_at_4.20.25_AM_ktho1u.mov "Screen_Recording_2021-10-14_at_4.20.25_AM_ktho1u")

[Pathfinding with obstacles](https://res.cloudinary.com/dbifqlg1w/video/upload/v1731324048/posts/Screen_Recording_2021-10-14_at_4.26.23_AM_ht34vb.mov "Screen_Recording_2021-10-14_at_4.26.23_AM_ht34vb")

[Item picking animation](https://res.cloudinary.com/dbifqlg1w/video/upload/v1731325115/posts/Screen_Recording_2024-11-11_at_7.37.30_PM_epdquh.mov "Screen_Recording_2024-11-11_at_7.37.30_PM_epdquh")
