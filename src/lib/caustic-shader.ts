/**
 * Procedural underwater caustic shader (no textures, no asset deps).
 * Layered Voronoi noise → light filaments. Cheap on the GPU.
 *
 * Used by `<CausticProjector>` to render into an FBO that becomes a
 * `THREE.SpotLight.map` cookie. Result: shifting bright "light spots"
 * crawl across the sea floor and divers — classic underwater look.
 */

export const causticVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

export const causticFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor;

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float voronoiCaustic(vec2 x, float t) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float md = 8.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash2(n + g);
        o = 0.5 + 0.5 * sin(t + 6.2831 * o);
        vec2 r = g + o - f;
        float d = dot(r, r);
        md = min(md, d);
      }
    }
    return md;
  }

  void main() {
    vec2 uv = vUv * 5.0;
    float t = uTime * 0.35;

    float c1 = voronoiCaustic(uv, t);
    float c2 = voronoiCaustic(uv * 1.6 + 4.4, t * 1.3);
    float c = mix(c1, c2, 0.5);
    c = pow(1.0 - c, 7.0);
    c *= uIntensity;

    vec3 col = uColor * c;
    /* feather edges so the light cookie does not show hard square seams */
    float edge = smoothstep(0.0, 0.2, vUv.x) * smoothstep(0.0, 0.2, vUv.y)
               * smoothstep(0.0, 0.2, 1.0 - vUv.x) * smoothstep(0.0, 0.2, 1.0 - vUv.y);
    col *= edge;

    gl_FragColor = vec4(col, 1.0);
  }
`
