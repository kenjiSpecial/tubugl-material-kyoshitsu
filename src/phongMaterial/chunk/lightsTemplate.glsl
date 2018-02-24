// lightsTemplate.glsl

GeometricContext geometry;

geometry.position = -vViewPosition;
geometry.normal = normal;
geometry.viewDir = normalize( vViewPosition );

// direct light

IncidentLight directLight;

// point light

getPointDirectLightIrradiance( pointLight, geometry, directLight );
RE_Direct_BlinnPhong( directLight, geometry, material, reflectedLight );

// directional light

getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );
RE_Direct_BlinnPhong( directLight, geometry, material, reflectedLight );

// ambientLight
vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

RE_IndirectDiffuse_BlinnPhong( irradiance, geometry, material, reflectedLight );

// lightsTemplate.glsl
