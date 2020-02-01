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


## Cache

I have setup a HUD scene that is stacked on-top of the main scene. This HUD is intended to show, well, HUD items. I had the sprites I needed
already loaded through the main scene, and didn't want to re-load the same sprite sheet again. I recalled a technique by John Carmack in which
you should always try the obvious approach first, and only when that doesn't work - think about the clever approach. The "obvious" approach
in this instance was to just re-use the same code in the HUD scene to load the `s_objects` sprite sheet.

```javascript
this.load.multiatlas('s_objects', 'objects/objects.json', 'objects');
```

When this code runs an error is thrown in the console. The `s_objects` key is already in use, since it's being loaded in the main scene. The
question is, how can I access another scenes resources? My thought was perhaps to create a store and manually add any shared assets in said
store that can be accessed by any class. 

Instead of implementing this from scratch I had figured that it was surely already something built-in to Phaser. There's no way a performant
game engine wouldn't cache the assets, so I'll start there.

Reading through the docs, it is clear there is exactly this sort of functionality built-in. The `CacheManager` class handles all of the caching
required by Phaser. Whenever you use `this.load.x` method calls, a reference is stored in the cache. The cache is supposed to be available
in the scene using `this.cache` and chaining whatever resource type you need with it.

```javascript
this.cache.json.get('key');
```

When I set a breakpoint in the `create` method of my main scene, or HUD scene, I get a chance to explore this data via the web console. I 
access `this.cache` and was returned an object. I investigated the object and found that all of the entries for each respective
asset type, were totally empty. 


## Dashes

I wanted to create another mechanism for the player to escape danger in the form of a lateral dash. My goal was to 
allow the left (`a`) or right (`d`) key to be double-tapped quickly in order to execute the move.

The problem I have run into is the exact method in which to implement this. My initial thought was perhaps
there was already a built-in method in the Phaser API that would easily allow me to set a sequential order
of keys and pass a callback to execute, or something of that nature. I was unable to find such a method, so
my next thought was to look for something that kept a timer between keystrokes. That way a user couldn't tap D twice
in 1-2 seconds and still execute a dash.

The Phaser API has support for this kind of thing, but it was not executing when I tried it. I registered the
key sequence on the keyboard object, and then set-up a listener with a callback.

```typescript
this.currentScene.input.keyboard.createCombo("dd", { maxKeyDelay: 1000 });

this.currentScene.input.on("keycombomatch", (e) => {
    debugger;
});
```

I set the `maxKeyDelay` to a full second to give me a starting point that I could then whittle down slowly until
I found a sweet spot. However, like I said, this code just didn't execute.

Well, I just found the solution. In my event listener, I forgot to listen to `keyboard`.

```typescript
this.currentScene.input.keyboard.on("keycombomatch", () => {});
```

Funny enough, after testing this input method - I don't like it. The benefit is lost because the act of double tapping
a key, even quickly, causes the character to stutter and basically defeats the purpose. I think what I'll do instead 
is assign the `Shift` key as a dash instead.