vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
vec4 mvPosition = viewMatrix * worldPosition;

gl_Position = projectionMatrix * mvPosition;