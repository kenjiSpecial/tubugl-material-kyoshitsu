// lightPars.glsl

uniform vec3 ambientLightColor;

vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {

	vec3 irradiance = ambientLightColor;

	// #ifndef PHYSICALLY_CORRECT_LIGHTS

		irradiance *= PI;

	// #endif

	return irradiance;

}


struct DirectionalLight {
    vec3 direction;
    vec3 color;
};

uniform DirectionalLight directionalLight;

void getDirectionalDirectLightIrradiance( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight ) {

    directLight.color = directionalLight.color;
    directLight.direction = directionalLight.direction;

}

struct PointLight {
    vec3 position;
    vec3 color;
    float distance;
    float decay;

};

uniform PointLight pointLight;


// directLight is an out parameter as having it as a return value caused compiler errors on some devices
void getPointDirectLightIrradiance( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight directLight ) {

    vec3 lVector = vec3(viewMatrix * vec4(pointLight.position, 1.0)) - geometry.position;
    directLight.direction = normalize( lVector );

    float lightDistance = length( lVector );

    directLight.color = pointLight.color;
    directLight.color *= punctualLightIntensityToIrradianceFactor( lightDistance, pointLight.distance, pointLight.decay );
    directLight.visible = ( directLight.color != vec3( 0.0 ) );

}

// lightPars.glsl