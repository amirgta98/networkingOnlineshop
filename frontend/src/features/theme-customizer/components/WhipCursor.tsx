"use client";

/**
 * WhipCursor — 3D Interactive Physics Whip Cursor
 * Feature: theme-customizer
 *
 * Simulates a realistic 3D braided leather whip following the cursor with:
 *  - 26 Verlet-integrated physics nodes for the whip body
 *  - 4 dynamic leather tassels / crackers at the tip
 *  - Kinematic traveling wave propagation on click (strike)
 *  - Procedural Web Audio API sound (wind whoosh + supersonic sonic crack)
 *  - Expanding sonic shockwave rings and spark particle bursts
 *  - Dynamic 3D depth shadows and braided leather rendering
 *  - Precise targeting dot for pixel-perfect UI interactions
 *
 * Completely non-blocking (pointer-events: none) and adapts dynamically to
 * site theme (Dark / Light mode) and sound preferences.
 */

import * as React from "react";
import { useTheme } from "../context/ThemeContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const NUM_MAIN_NODES = 26;
const SEGMENT_LENGTH = 9.5;
const NUM_STRANDS = 4;
const STRAND_NODES = 8;
const STRAND_SEG_LEN = 7.5;

interface NodePoint {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  z: number;
  oldZ: number;
  radius: number;
}

interface StrandNode {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
}

interface Strand {
  attachIndex: number;
  color: string;
  lightColor: string;
  drag: number;
  gravity: number;
  nodes: StrandNode[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  lineWidth: number;
}

interface SlashMark {
  x: number;
  y: number;
  angle: number;
  length: number;
  alpha: number;
}

export function WhipCursor() {
  const { theme } = useTheme();
  const isWhipActive = theme.cursor?.mode === "whip";
  const soundEnabled = theme.cursor?.soundEnabled ?? true;
  const isDarkTheme = theme.mode !== "light";

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // AudioContext reference
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  // Sound ref to access inside requestAnimationFrame loop without re-binding
  const soundEnabledRef = React.useRef(soundEnabled);
  React.useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const isDarkThemeRef = React.useRef(isDarkTheme);
  React.useEffect(() => {
    isDarkThemeRef.current = isDarkTheme;
  }, [isDarkTheme]);

  // If whip mode is not active, render nothing
  React.useEffect(() => {
    if (!isWhipActive) {
      document.body.classList.remove("whip-cursor-active");
      return;
    }

    document.body.classList.add("whip-cursor-active");
    return () => {
      document.body.classList.remove("whip-cursor-active");
    };
  }, [isWhipActive]);

  React.useEffect(() => {
    if (!isWhipActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resizeCanvas() {
      if (!canvas || !ctx) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse & Handle state
    const mouse = {
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      prevX: width / 2,
      prevY: height / 2,
      visible: true,
    };

    const handle = {
      x: width / 2,
      y: height / 2,
      angle: -Math.PI / 4,
      targetAngle: -Math.PI / 4,
      length: 75,
      strikeOffsetAngle: 0,
      strikePushX: 0,
      strikePushY: 0,
    };

    // Verlet nodes
    const mainNodes: NodePoint[] = [];
    for (let i = 0; i < NUM_MAIN_NODES; i++) {
      mainNodes.push({
        x: width / 2 + i * SEGMENT_LENGTH,
        y: height / 2 + i * SEGMENT_LENGTH,
        oldX: width / 2 + i * SEGMENT_LENGTH,
        oldY: height / 2 + i * SEGMENT_LENGTH,
        z: 0,
        oldZ: 0,
        radius: Math.max(1.3, 9.5 * Math.pow(1 - i / (NUM_MAIN_NODES - 1), 0.75)),
      });
    }

    // Tassels / Crackers strands
    const strands: Strand[] = [];
    for (let s = 0; s < NUM_STRANDS; s++) {
      const strand: Strand = {
        attachIndex: NUM_MAIN_NODES - 1 - (s === 3 ? 2 : 0),
        color: s % 2 === 0 ? "#d97706" : "#b45309",
        lightColor: s % 2 === 0 ? "#fbbf24" : "#f59e0b",
        drag: 0.92 + s * 0.012,
        gravity: 0.22 + s * 0.04,
        nodes: [],
      };
      for (let n = 0; n < STRAND_NODES; n++) {
        strand.nodes.push({
          x: width / 2,
          y: height / 2,
          oldX: width / 2,
          oldY: height / 2,
        });
      }
      strands.push(strand);
    }

    // Visual effect collections
    const particles: Particle[] = [];
    const shockwaves: Shockwave[] = [];
    const slashMarks: SlashMark[] = [];

    // Strike wave state
    const strikeState = {
      active: false,
      timer: 0,
      duration: 18,
      dirX: 1,
      dirY: 0,
      perpX: 0,
      perpY: 1,
      targetX: 0,
      targetY: 0,
      cracked: false,
    };

    let lastWhooshTime = 0;

    // ── Web Audio API ─────────────────────────────────────────────────────────

    function initAudio(): AudioContext | null {
      try {
        if (!audioCtxRef.current && typeof window !== "undefined") {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
          if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
          }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
      } catch {
        return null;
      }
    }

    function playWhipWhoosh(speed: number) {
      if (!soundEnabledRef.current) return;
      const actx = initAudio();
      if (!actx) return;

      try {
        const now = actx.currentTime;
        const bufferSize = Math.floor(actx.sampleRate * 0.15);
        const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = actx.createBufferSource();
        noise.buffer = buffer;

        const filter = actx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(180 + Math.min(speed * 8, 600), now);
        filter.Q.setValueAtTime(2.5, now);

        const gain = actx.createGain();
        const vol = Math.min(speed / 140, 0.2);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(actx.destination);

        noise.start(now);
        noise.stop(now + 0.15);
      } catch {
        // Audio error suppression
      }
    }

    function playWhipCrackSound() {
      if (!soundEnabledRef.current) return;
      const actx = initAudio();
      if (!actx) return;

      try {
        const now = actx.currentTime;

        // 1. Swoosh before crack
        const swooshDur = 0.12;
        const swooshBuf = actx.createBuffer(
          1,
          Math.floor(actx.sampleRate * swooshDur),
          actx.sampleRate
        );
        const swooshData = swooshBuf.getChannelData(0);
        for (let i = 0; i < swooshData.length; i++) {
          swooshData[i] =
            (Math.random() * 2 - 1) *
            Math.sin((i / swooshData.length) * Math.PI);
        }
        const swooshNoise = actx.createBufferSource();
        swooshNoise.buffer = swooshBuf;

        const swooshFilter = actx.createBiquadFilter();
        swooshFilter.type = "bandpass";
        swooshFilter.frequency.setValueAtTime(220, now);
        swooshFilter.frequency.exponentialRampToValueAtTime(
          1400,
          now + swooshDur
        );
        swooshFilter.Q.setValueAtTime(1.8, now);

        const swooshGain = actx.createGain();
        swooshGain.gain.setValueAtTime(0.01, now);
        swooshGain.gain.linearRampToValueAtTime(0.28, now + swooshDur * 0.7);
        swooshGain.gain.exponentialRampToValueAtTime(0.01, now + swooshDur);

        swooshNoise.connect(swooshFilter);
        swooshFilter.connect(swooshGain);
        swooshGain.connect(actx.destination);
        swooshNoise.start(now);

        // 2. Sonic Boom Crack
        const crackTime = now + 0.065;
        const crackDur = 0.22;
        const crackBuf = actx.createBuffer(
          1,
          Math.floor(actx.sampleRate * crackDur),
          actx.sampleRate
        );
        const crackData = crackBuf.getChannelData(0);
        for (let i = 0; i < crackData.length; i++) {
          const env = Math.pow(1 - i / crackData.length, 2.8);
          crackData[i] = (Math.random() * 2 - 1) * env;
        }
        const crackNoise = actx.createBufferSource();
        crackNoise.buffer = crackBuf;

        const crackFilter = actx.createBiquadFilter();
        crackFilter.type = "highpass";
        crackFilter.frequency.setValueAtTime(900, crackTime);

        const crackGain = actx.createGain();
        crackGain.gain.setValueAtTime(0.001, crackTime);
        crackGain.gain.linearRampToValueAtTime(0.7, crackTime + 0.004);
        crackGain.gain.exponentialRampToValueAtTime(0.1, crackTime + 0.045);
        crackGain.gain.exponentialRampToValueAtTime(0.0001, crackTime + crackDur);

        crackNoise.connect(crackFilter);
        crackFilter.connect(crackGain);
        crackGain.connect(actx.destination);
        crackNoise.start(crackTime);

        // 3. Snap punch (triangle body)
        const osc = actx.createOscillator();
        const oscGain = actx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(320, crackTime);
        osc.frequency.exponentialRampToValueAtTime(42, crackTime + 0.08);

        oscGain.gain.setValueAtTime(0.45, crackTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, crackTime + 0.085);

        osc.connect(oscGain);
        oscGain.connect(actx.destination);
        osc.start(crackTime);
        osc.stop(crackTime + 0.09);
      } catch {
        // Audio error suppression
      }
    }

    function getHandleTipPosition() {
      const totalAngle = handle.angle + handle.strikeOffsetAngle;
      const tipX =
        handle.x + handle.strikePushX + Math.cos(totalAngle) * (handle.length * 0.55);
      const tipY =
        handle.y + handle.strikePushY + Math.sin(totalAngle) * (handle.length * 0.55);
      return { x: tipX, y: tipY, angle: totalAngle };
    }

    function triggerWhipStrike(clickX: number, clickY: number) {
      const base = getHandleTipPosition();
      let dx = clickX - base.x;
      let dy = clickY - base.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 10) {
        dx = Math.cos(handle.angle);
        dy = Math.sin(handle.angle);
      } else {
        dx /= dist;
        dy /= dist;
      }

      strikeState.active = true;
      strikeState.timer = 0;
      strikeState.dirX = dx;
      strikeState.dirY = dy;
      strikeState.perpX = -dy;
      strikeState.perpY = dx;
      strikeState.targetX = clickX + dx * (NUM_MAIN_NODES * SEGMENT_LENGTH * 0.68);
      strikeState.targetY = clickY + dy * (NUM_MAIN_NODES * SEGMENT_LENGTH * 0.68);
      strikeState.cracked = false;

      handle.strikeOffsetAngle = -0.85;
      handle.strikePushX = -dx * 22;
      handle.strikePushY = -dy * 22;

      for (let i = 1; i < NUM_MAIN_NODES; i++) {
        const t = i / NUM_MAIN_NODES;
        const waveAmp = Math.sin(t * Math.PI * 1.5) * 18;
        mainNodes[i].oldX -= dx * 14 * t + strikeState.perpX * waveAmp;
        mainNodes[i].oldY -= dy * 14 * t + strikeState.perpY * waveAmp;
        mainNodes[i].z = Math.sin(t * Math.PI) * 28;
      }

      playWhipCrackSound();
    }

    function createCrackEffects(x: number, y: number, dirX: number, dirY: number) {
      // Subtle canvas shake via CSS without moving document.body
      if (canvas) {
        canvas.classList.remove("whip-canvas-shake");
        void canvas.offsetWidth;
        canvas.classList.add("whip-canvas-shake");
      }

      // Sonic Rings
      shockwaves.push({
        x,
        y,
        radius: 4,
        maxRadius: 95,
        alpha: 0.9,
        lineWidth: 5,
      });
      shockwaves.push({
        x,
        y,
        radius: 2,
        maxRadius: 50,
        alpha: 0.7,
        lineWidth: 2.5,
      });

      // Slash mark
      const markAngle = Math.atan2(dirY, dirX) + (Math.random() - 0.5) * 0.4;
      slashMarks.push({
        x,
        y,
        angle: markAngle,
        length: 45 + Math.random() * 35,
        alpha: 0.65,
      });
      if (slashMarks.length > 25) slashMarks.shift();

      // Sparks
      const sparkCount = 28;
      for (let i = 0; i < sparkCount; i++) {
        const spreadAngle =
          Math.atan2(dirY, dirX) + (Math.random() - 0.5) * 2.2;
        const speed = 3 + Math.random() * 14;
        const isGold = Math.random() > 0.3;
        particles.push({
          x,
          y,
          vx: Math.cos(spreadAngle) * speed,
          vy: Math.sin(spreadAngle) * speed,
          size: 1.5 + Math.random() * 2.8,
          alpha: 1,
          decay: 0.025 + Math.random() * 0.03,
          color: isGold ? "#fbbf24" : "#ffffff",
        });
      }
    }

    // ── Physics Update ────────────────────────────────────────────────────────

    function updatePhysics() {
      mouse.vx = mouse.x - mouse.prevX;
      mouse.vy = mouse.y - mouse.prevY;
      const mouseSpeed = Math.hypot(mouse.vx, mouse.vy);

      const now = performance.now();
      if (
        mouseSpeed > 38 &&
        now - lastWhooshTime > 180 &&
        !strikeState.active
      ) {
        playWhipWhoosh(mouseSpeed);
        lastWhooshTime = now;
      }

      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      // Smooth handle interpolation
      handle.x += (mouse.x - handle.x) * 0.5;
      handle.y += (mouse.y - handle.y) * 0.5;

      if (mouseSpeed > 1.8) {
        handle.targetAngle = Math.atan2(mouse.vy, mouse.vx);
      } else {
        const dxToRope = mainNodes[3].x - handle.x;
        const dyToRope = mainNodes[3].y - handle.y;
        handle.targetAngle = Math.atan2(dyToRope, dxToRope) - 0.25;
      }

      let angleDiff = handle.targetAngle - handle.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      handle.angle += angleDiff * 0.18;

      handle.strikeOffsetAngle *= 0.82;
      handle.strikePushX *= 0.82;
      handle.strikePushY *= 0.82;

      // Strike wave propagation
      if (strikeState.active) {
        strikeState.timer++;
        const progress = strikeState.timer / strikeState.duration;

        if (progress < 0.45) {
          handle.strikeOffsetAngle =
            Math.sin(progress * Math.PI * 2.2) * 1.15;
          handle.strikePushX =
            strikeState.dirX * 26 * Math.sin(progress * Math.PI * 2);
          handle.strikePushY =
            strikeState.dirY * 26 * Math.sin(progress * Math.PI * 2);
        }

        const waveCenter = progress * 1.15;
        for (let i = 1; i < NUM_MAIN_NODES; i++) {
          const nodeNorm = i / (NUM_MAIN_NODES - 1);
          const distFromWave = nodeNorm - waveCenter;

          if (Math.abs(distFromWave) < 0.28) {
            const whipAmplifier = 1 + Math.pow(nodeNorm, 2.2) * 3.8;
            const forwardPulse =
              Math.cos(distFromWave * Math.PI * 3.5) * 4.2 * whipAmplifier;
            const lateralSnap =
              Math.sin(distFromWave * Math.PI * 7) * 5.5 * whipAmplifier;

            mainNodes[i].x +=
              strikeState.dirX * forwardPulse +
              strikeState.perpX * lateralSnap;
            mainNodes[i].y +=
              strikeState.dirY * forwardPulse +
              strikeState.perpY * lateralSnap;
            mainNodes[i].z = Math.max(
              0,
              Math.cos(distFromWave * Math.PI * 3) *
                35 *
                (1 - nodeNorm * 0.3)
            );
          }
        }

        if (progress >= 0.55 && !strikeState.cracked) {
          strikeState.cracked = true;
          const tipNode = mainNodes[NUM_MAIN_NODES - 1];
          tipNode.x += strikeState.dirX * 32;
          tipNode.y += strikeState.dirY * 32;
          createCrackEffects(
            tipNode.x,
            tipNode.y,
            strikeState.dirX,
            strikeState.dirY
          );

          strands.forEach((strand, idx) => {
            strand.nodes.forEach((sn, nIdx) => {
              const spread = (idx - 1.5) * 8;
              sn.x +=
                (strikeState.dirX * 24 + strikeState.perpX * spread) *
                (nIdx / STRAND_NODES);
              sn.y +=
                (strikeState.dirY * 24 + strikeState.perpY * spread) *
                (nIdx / STRAND_NODES);
            });
          });
        }

        if (strikeState.timer >= strikeState.duration) {
          strikeState.active = false;
        }
      }

      const handleTip = getHandleTipPosition();

      // 1. Verlet Integration
      for (let i = 0; i < NUM_MAIN_NODES; i++) {
        const n = mainNodes[i];
        if (i === 0) {
          n.x = handleTip.x;
          n.y = handleTip.y;
          n.z = 12;
          continue;
        }

        const t = i / (NUM_MAIN_NODES - 1);
        const damping = 0.945 - t * 0.025;
        const gravity = 0.28 * (1 - t * 0.35);

        const vx = (n.x - n.oldX) * damping;
        const vy = (n.y - n.oldY) * damping;
        const vz = (n.z - n.oldZ) * 0.85;

        n.oldX = n.x;
        n.oldY = n.y;
        n.oldZ = n.z;

        n.x += vx;
        n.y += vy + gravity;
        n.z = Math.max(0, n.z + vz - 0.6);
      }

      // 2. Stiffness + Distance Constraints
      const ITERATIONS = 14;
      for (let iter = 0; iter < ITERATIONS; iter++) {
        mainNodes[0].x = handleTip.x;
        mainNodes[0].y = handleTip.y;

        for (let i = 1; i <= 4; i++) {
          const stiffness = (5 - i) * 0.085;
          const idealX =
            handleTip.x + Math.cos(handleTip.angle) * (i * SEGMENT_LENGTH);
          const idealY =
            handleTip.y + Math.sin(handleTip.angle) * (i * SEGMENT_LENGTH);
          mainNodes[i].x += (idealX - mainNodes[i].x) * stiffness;
          mainNodes[i].y += (idealY - mainNodes[i].y) * stiffness;
        }

        for (let i = 0; i < NUM_MAIN_NODES - 1; i++) {
          const n1 = mainNodes[i];
          const n2 = mainNodes[i + 1];

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const diff = (SEGMENT_LENGTH - dist) / dist;

          if (i === 0) {
            n2.x += dx * diff;
            n2.y += dy * diff;
          } else {
            const w1 = 0.38;
            const w2 = 0.62;
            n1.x -= dx * diff * w1;
            n1.y -= dy * diff * w1;
            n2.x += dx * diff * w2;
            n2.y += dy * diff * w2;
          }
        }
      }

      // 3. Tassels / Crackers physics
      strands.forEach((strand, sIdx) => {
        const anchor = mainNodes[strand.attachIndex];
        const prevAnchor = mainNodes[strand.attachIndex - 1];
        const tailAngle = Math.atan2(
          anchor.y - prevAnchor.y,
          anchor.x - prevAnchor.x
        );

        for (let i = 0; i < strand.nodes.length; i++) {
          const sn = strand.nodes[i];
          if (i === 0) {
            sn.x = anchor.x;
            sn.y = anchor.y;
            continue;
          }

          const vx = (sn.x - sn.oldX) * strand.drag;
          const vy = (sn.y - sn.oldY) * strand.drag;

          sn.oldX = sn.x;
          sn.oldY = sn.y;

          const flutter =
            Math.sin(performance.now() * 0.025 + sIdx * 2 + i) *
            0.35 *
            (Math.hypot(vx, vy) * 0.15);
          sn.x += vx + Math.cos(tailAngle + Math.PI / 2) * flutter;
          sn.y += vy + strand.gravity + Math.sin(tailAngle + Math.PI / 2) * flutter;
        }

        for (let iter = 0; iter < 8; iter++) {
          strand.nodes[0].x = anchor.x;
          strand.nodes[0].y = anchor.y;

          for (let i = 0; i < strand.nodes.length - 1; i++) {
            const n1 = strand.nodes[i];
            const n2 = strand.nodes[i + 1];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.hypot(dx, dy) || 0.0001;
            const diff = (STRAND_SEG_LEN - dist) / dist;

            if (i === 0) {
              n2.x += dx * diff;
              n2.y += dy * diff;
            } else {
              n1.x -= dx * diff * 0.35;
              n1.y -= dy * diff * 0.35;
              n2.x += dx * diff * 0.65;
              n2.y += dy * diff * 0.65;
            }
          }
        }
      });

      // 4. Update particles, shockwaves, slashes
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.92;
        p.vy = p.vy * 0.92 + 0.18;
        p.alpha -= p.decay;
        if (p.alpha <= 0) particles.splice(i, 1);
      }

      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.22;
        sw.alpha *= 0.84;
        sw.lineWidth *= 0.9;
        if (sw.alpha < 0.02) shockwaves.splice(i, 1);
      }

      for (let i = slashMarks.length - 1; i >= 0; i--) {
        slashMarks[i].alpha -= 0.0015;
        if (slashMarks[i].alpha <= 0) slashMarks.splice(i, 1);
      }
    }

    // ── Drawing Scene ─────────────────────────────────────────────────────────

    function drawScene() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const dark = isDarkThemeRef.current;

      // 1. Slash marks
      slashMarks.forEach((mark) => {
        ctx.save();
        ctx.translate(mark.x, mark.y);
        ctx.rotate(mark.angle);
        const grad = ctx.createLinearGradient(
          -mark.length / 2,
          0,
          mark.length / 2,
          0
        );
        const markColor = dark ? "251, 191, 36" : "180, 83, 9";
        grad.addColorStop(0, `rgba(${markColor}, 0)`);
        grad.addColorStop(0.5, `rgba(${markColor}, ${mark.alpha * 0.45})`);
        grad.addColorStop(1, `rgba(${markColor}, 0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-mark.length / 2, 0);
        ctx.quadraticCurveTo(0, -4, mark.length / 2, 0);
        ctx.stroke();
        ctx.restore();
      });

      // 2. Dynamic 3D depth shadow
      ctx.save();
      for (let i = 0; i < NUM_MAIN_NODES - 1; i++) {
        const n1 = mainNodes[i];
        const n2 = mainNodes[i + 1];
        const shadowOffset1 = 14 + n1.z * 0.65;
        const shadowOffset2 = 14 + n2.z * 0.65;

        ctx.beginPath();
        ctx.moveTo(n1.x + shadowOffset1 * 0.6, n1.y + shadowOffset1);
        ctx.lineTo(n2.x + shadowOffset2 * 0.6, n2.y + shadowOffset2);
        ctx.strokeStyle = dark
          ? "rgba(0, 0, 0, 0.42)"
          : "rgba(15, 23, 42, 0.16)";
        ctx.lineWidth = (n1.radius + n2.radius) * 1.15;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      strands.forEach((strand) => {
        ctx.beginPath();
        for (let i = 0; i < strand.nodes.length; i++) {
          const sn = strand.nodes[i];
          if (i === 0) ctx.moveTo(sn.x + 10, sn.y + 16);
          else ctx.lineTo(sn.x + 10, sn.y + 16);
        }
        ctx.strokeStyle = dark
          ? "rgba(0, 0, 0, 0.3)"
          : "rgba(15, 23, 42, 0.12)";
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.stroke();
      });
      ctx.restore();

      // 3. Tassels / Crackers strands
      strands.forEach((strand) => {
        for (let i = 0; i < strand.nodes.length - 1; i++) {
          const n1 = strand.nodes[i];
          const n2 = strand.nodes[i + 1];
          const t = i / (strand.nodes.length - 1);
          const thickness = Math.max(0.9, (1 - t) * 2.8);

          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = strand.color;
          ctx.lineWidth = thickness;
          ctx.lineCap = "round";
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(n1.x - 0.5, n1.y - 0.5);
          ctx.lineTo(n2.x - 0.5, n2.y - 0.5);
          ctx.strokeStyle = strand.lightColor;
          ctx.lineWidth = thickness * 0.35;
          ctx.stroke();
        }
      });

      // 4. Braided 3D Leather Body
      for (let i = 0; i < NUM_MAIN_NODES - 1; i++) {
        const n1 = mainNodes[i];
        const n2 = mainNodes[i + 1];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const angle = Math.atan2(dy, dx);
        const perpX = -Math.sin(angle);
        const perpY = Math.cos(angle);
        const r = (n1.radius + n2.radius) * 0.5;

        // Dark leather cylinder base
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = "#3b1909";
        ctx.lineWidth = r * 2.1;
        ctx.lineCap = "round";
        ctx.stroke();

        // Warm brown leather core
        ctx.beginPath();
        ctx.moveTo(n1.x - perpX * (r * 0.15), n1.y - perpY * (r * 0.15));
        ctx.lineTo(n2.x - perpX * (r * 0.15), n2.y - perpY * (r * 0.15));
        ctx.strokeStyle = i % 2 === 0 ? "#78350f" : "#92400e";
        ctx.lineWidth = r * 1.65;
        ctx.lineCap = "round";
        ctx.stroke();

        // Braided cross-strands
        const braidWave1 = Math.sin(i * 1.1) * r * 0.65;
        const braidWave2 = Math.cos(i * 1.1) * r * 0.65;

        ctx.beginPath();
        ctx.moveTo(n1.x + perpX * braidWave1, n1.y + perpY * braidWave1);
        ctx.lineTo(n2.x - perpX * braidWave1, n2.y - perpY * braidWave1);
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = Math.max(1, r * 0.55);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(n1.x - perpX * braidWave2, n1.y - perpY * braidWave2);
        ctx.lineTo(n2.x + perpX * braidWave2, n2.y + perpY * braidWave2);
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = Math.max(0.8, r * 0.4);
        ctx.stroke();

        // Specular rim light
        ctx.beginPath();
        ctx.moveTo(n1.x - perpX * (r * 0.42), n1.y - perpY * (r * 0.42));
        ctx.lineTo(n2.x - perpX * (r * 0.42), n2.y - perpY * (r * 0.42));
        ctx.strokeStyle = "rgba(253, 224, 71, 0.28)";
        ctx.lineWidth = Math.max(0.8, r * 0.42);
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // 5. 3D Handle
      draw3DHandle();

      // 6. Shockwaves & Spark Particles
      shockwaves.forEach((sw) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = dark
          ? `rgba(251, 191, 36, ${sw.alpha})`
          : `rgba(217, 119, 6, ${sw.alpha})`;
        ctx.lineWidth = sw.lineWidth;
        ctx.stroke();
        ctx.restore();
      });

      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 7. Precise Pointer Indicator Bead at exact mouse position
      ctx.save();
      ctx.fillStyle = "#fbbf24";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function draw3DHandle() {
      if (!ctx) return;
      const totalAngle = handle.angle + handle.strikeOffsetAngle;
      const cx = handle.x + handle.strikePushX;
      const cy = handle.y + handle.strikePushY;
      const dark = isDarkThemeRef.current;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(totalAngle);

      const backLen = -handle.length * 0.45;
      const frontLen = handle.length * 0.55;
      const handleRadius = 8.5;

      // Handle shadow
      ctx.fillStyle = dark ? "rgba(0,0,0,0.5)" : "rgba(15,23,42,0.22)";
      ctx.beginPath();
      ctx.roundRect(
        backLen + 6,
        -handleRadius + 14,
        handle.length,
        handleRadius * 2,
        8
      );
      ctx.fill();

      // Leather grip cylinder
      const grad = ctx.createLinearGradient(0, -handleRadius, 0, handleRadius);
      grad.addColorStop(0, "#92400e");
      grad.addColorStop(0.25, "#d97706");
      grad.addColorStop(0.55, "#78350f");
      grad.addColorStop(1, "#290f02");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(
        backLen,
        -handleRadius,
        handle.length,
        handleRadius * 2,
        6
      );
      ctx.fill();

      // Cross-hatching leather grip
      ctx.strokeStyle = "rgba(41, 15, 2, 0.65)";
      ctx.lineWidth = 1.6;
      for (let x = backLen + 10; x < frontLen - 12; x += 8) {
        ctx.beginPath();
        ctx.moveTo(x, -handleRadius + 1);
        ctx.lineTo(x + 6, handleRadius - 1);
        ctx.moveTo(x + 6, -handleRadius + 1);
        ctx.lineTo(x, handleRadius - 1);
        ctx.stroke();
      }

      // Metallic Pommel Cap (Gold)
      const goldGrad = ctx.createLinearGradient(
        0,
        -handleRadius - 2,
        0,
        handleRadius + 2
      );
      goldGrad.addColorStop(0, "#fef08a");
      goldGrad.addColorStop(0.4, "#f59e0b");
      goldGrad.addColorStop(0.8, "#b45309");
      goldGrad.addColorStop(1, "#451a03");

      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.arc(backLen, 0, handleRadius * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // Transition Ferrule Ring
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.roundRect(
        frontLen - 9,
        -handleRadius * 1.05,
        11,
        handleRadius * 2.1,
        3
      );
      ctx.fill();

      // Pivot dot on handle
      ctx.fillStyle = "rgba(254, 240, 138, 0.9)";
      ctx.beginPath();
      ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // ── Input Event Listeners ─────────────────────────────────────────────────

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.visible = true;
    };

    const onMouseDown = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      triggerWhipStrike(e.clientX, e.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        mouse.x = t.clientX;
        mouse.y = t.clientY;
        triggerWhipStrike(t.clientX, t.clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        mouse.x = t.clientX;
        mouse.y = t.clientY;
      }
    };

    const onMouseLeave = () => {
      mouse.visible = false;
      document.body.classList.remove("whip-cursor-active");
    };

    const onMouseEnter = () => {
      mouse.visible = true;
      document.body.classList.add("whip-cursor-active");
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // ── Main Animation Loop ───────────────────────────────────────────────────

    function animate() {
      updatePhysics();
      drawScene();
      animFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);

      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // Cleanup suppression
        }
        audioCtxRef.current = null;
      }
    };
  }, [isWhipActive]);

  if (!isWhipActive) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[99999] block w-full h-full"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 99999,
      }}
    />
  );
}
