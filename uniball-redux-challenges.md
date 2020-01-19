# Uniball Redux

Challenges:
- Phaser is difficult to find solutions for. Specific problems aren't usually documented. Unity and Unreal have huge audiences and because of that you can usually find an answer to very specific problems relatively quickly.
- Phasers documentation is just generated API docs. It's not bad if you know what you're doing, but for newbies this is going to be a huge barrier to entry. Even for someone experienced like myself, I found the docs to be extremely frustrating. 
- There are multiple versions of Phaser (2, CE, 3), each of which has unique API's. This can make searching for problems even more difficult as you are likely going to find answers for Phaser 2 and not 3.


## Animations

When you create a new animation, you define it in an object and pass that object to the `anims.create` method. I had a cryptic issue where the frames I was generating for an animation, were returning 0 frames. Phaser doesn't throw any errors in this instance, instead it gives you an error after you attempt to use the animation.

The error is something along the lines of `animationFrame is undefined`. After setting a breakpoint and inspecting all of the registered animations, I could see that this particular animation had no frames. Ultimately I realized I had a typo in the animation frames suffix property, `.pg` instead of `.png`. 

Personally I think that Phaser should throw an error whenever an animation you attempt to create has no frames, or at the very least a warning. I could potentially see cases where you create an empty animation so that frames could added dynamically.


## Tiled Ground

Initially, I had generated the ground sprite/texture by creating an `Arcade.StaticGroup`. Then using a `for` loop I generated a sprite every 32 pixels until the length of the canvas was covered. This seemed to work, however I began noticed odd behavior when an orb would riccochet off of the ground.

If an orb hit a point where two ground sprites met, the orb would have unpredictable bounce physics. Sometimes it would lose all of its velocity, sometimes it would follow the contour of the ground, other times it would bounce in the opposite direction.

I knew what was happening but I wasn't sure how to fix it. I toyed with an idea of rendering the sprites as static images and then creating a geometry rectangle overtop of it - giving it a physics collider instead. That idea probably would have worked, but I couldn't manage it. Then I realized there was two separate tiled types, `TileMap` and `TileSprite`.

TileSprite was the solution to the problem. It allowed me to generate the floor sprite to the length of the canvas with minimal code. Better yet though was that it only creates a single physics collider instead of 30+ in the scene. Problem solved.