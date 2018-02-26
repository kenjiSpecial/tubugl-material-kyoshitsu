// envmapVertex.glsl

vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
// vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );

if(uIsReflect){
    vReflect = reflect( cameraToVertex, transformedNormal );
}else{
    vReflect = refract( cameraToVertex, transformedNormal, refractionRatio );
}

// envmapVertex.glsl