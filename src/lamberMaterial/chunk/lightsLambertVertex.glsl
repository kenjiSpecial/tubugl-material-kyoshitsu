// lightsLambertVertex.glsl
vec3 diffuse = vec3( 1.0 );

GeometricContext geometry;
geometry.position = mvPosition.xyz;
geometry.normal = normalize( transformedNormal );
geometry.viewDir = normalize( -mvPosition.xyz );

GeometricContext backGeometry;
backGeometry.position = geometry.position;
backGeometry.normal = -geometry.normal;
backGeometry.viewDir = geometry.viewDir;

vLightFront = vec3(0.0);

IncidentLight directLight;
float dotNL;
vec3 directLightColor_Diffuse;

// Point Light
getPointDirectLightIrradiance( pointLight, geometry, directLight );

dotNL = dot( geometry.normal, directLight.direction );
directLightColor_Diffuse = PI * directLight.color;

vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;


// directional light
getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );

dotNL = dot( geometry.normal, directLight.direction );
directLightColor_Diffuse = PI * directLight.color;

vLightFront += saturate( dotNL ) * directLightColor_Diffuse;
vLightBack += saturate( -dotNL ) * directLightColor_Diffuse;

// lightsLambertVertex.glsl