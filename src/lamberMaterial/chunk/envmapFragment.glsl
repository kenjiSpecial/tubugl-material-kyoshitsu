// envmapFragment.glsl

vec3 reflectVec = vReflect;
vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
envColor = envMapTexelToLinear( envColor );
// envColor = envMapTexelToLinear( envColor );
outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );

// 