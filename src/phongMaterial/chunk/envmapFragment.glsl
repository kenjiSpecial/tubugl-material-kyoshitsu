// envmapFragment.glsl

// envmap
vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );

// Transforming Normal Vectors with the Inverse Transformation
vec3 worldNormal = vNormal; //inverseTransformDirection( vNormal, viewMatrix );

vec3 reflectVec;
if(uIsReflect){
    reflectVec = reflect( cameraToVertex, worldNormal );
}else{
    reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );
}

vec4 envColor = textureCube( envMap, vec3(  flipEnvMap * reflectVec.x, reflectVec.yz ) );
envColor = envMapTexelToLinear( envColor );
outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );

// envmapFragment.glsl