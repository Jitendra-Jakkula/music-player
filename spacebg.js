"use strict";

/* ====================================================================
   Decorative background only. Never touches player state or the
   audio element — if this throws, the player still works.
   ==================================================================== */

(function initSpaceBackground() {
  try {
    const canvas = document.getElementById("space-bg");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    // Static-ish starfield.
    const STAR_COUNT = 90;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2 + 0.3,
      twinkleSpeed: Math.random() * 0.015 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    // Small, slow drifting asteroids. Kept sparse and minimal.
    const ASTEROID_COUNT = 7;

    function makeAsteroid() {
      const size = Math.random() * 3 + 1.5;
      return {
        x: Math.random() * width,
        y: Math.random() * -height,
        size,
        speed: Math.random() * 0.18 + 0.06,
        drift: (Math.random() - 0.5) * 0.15,
        spin: (Math.random() - 0.5) * 0.01,
        angle: Math.random() * Math.PI * 2,
        tailLength: size * (Math.random() * 6 + 6),
        opacity: Math.random() * 0.35 + 0.25,
      };
    }

    const asteroids = Array.from({ length: ASTEROID_COUNT }, makeAsteroid);

    function drawStar(star, time) {
      const twinkle =
        0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase);
      ctx.globalAlpha = 0.25 + twinkle * 0.5;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#EDEFF7";
      ctx.fill();
    }

    function drawAsteroid(rock) {
      ctx.save();
      ctx.translate(rock.x, rock.y);
      ctx.rotate(rock.angle);

      // Faint falling tail.
      const tailGradient = ctx.createLinearGradient(0, 0, 0, -rock.tailLength);
      tailGradient.addColorStop(0, `rgba(255, 122, 69, ${rock.opacity})`);
      tailGradient.addColorStop(1, "rgba(255, 122, 69, 0)");
      ctx.strokeStyle = tailGradient;
      ctx.lineWidth = Math.max(rock.size * 0.4, 0.6);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -rock.tailLength);
      ctx.stroke();

      // Rock body.
      ctx.globalAlpha = rock.opacity;
      ctx.fillStyle = "#C7CBE0";
      ctx.beginPath();
      ctx.arc(0, 0, rock.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function step(time) {
      ctx.clearRect(0, 0, width, height);

      ctx.globalAlpha = 1;
      stars.forEach((star) => drawStar(star, time));

      ctx.globalAlpha = 1;
      asteroids.forEach((rock) => {
        drawAsteroid(rock);

        rock.y += rock.speed * 16;
        rock.x += rock.drift;
        rock.angle += rock.spin;

        if (rock.y - rock.tailLength > height) {
          Object.assign(rock, makeAsteroid(), { y: -20 });
        }
      });

      ctx.globalAlpha = 1;

      if (!prefersReducedMotion) {
        requestAnimationFrame(step);
      }
    }

    if (prefersReducedMotion) {
      // Draw one still frame so the backdrop isn't empty, then stop.
      step(0);
    } else {
      requestAnimationFrame(step);
    }
  } catch (error) {
    // Decorative failure should never be visible to the user.
    console.warn("Space background failed to initialize:", error);
  }
})();