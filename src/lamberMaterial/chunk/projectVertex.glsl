// projectVertex.glsl

vec4 mvPosition = viewMatrix * modelMatrix * vec4(transformed, 1.0);

gl_Position = projectionMatrix * mvPosition;

// projectVertex.glsl