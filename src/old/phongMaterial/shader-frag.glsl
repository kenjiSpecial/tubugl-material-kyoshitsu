precision mediump float;

varying vec3 vNormal;
varying vec3 vSurfaceToLight;
varying vec3 vSurfacetoView;

uniform vec3 uAmbientColor;
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;
uniform vec3 uLightColor;
uniform float uShininess;
uniform float uLightPower;

// const float uDistance = 1.0;
// const float uLightPower = 10000.0;

const float screenGamma = 2.2; // Assume the monitor is calibrated to the sRGB color space

void main(){
    vec3 normal = normalize(vNormal);
    vec3 surfaceToLightDirection = normalize(vSurfaceToLight);
    float surfaceToLightDistance =length(vSurfaceToLight);
    surfaceToLightDistance = surfaceToLightDistance * surfaceToLightDistance; 
    
    
    float lambertian = max(dot(surfaceToLightDirection, normal), 0.0);
    float specular = 0.0;
    
    if(lambertian > 0.0){
        vec3 surfaceToViewDirection = normalize(vSurfacetoView);
        vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
        float specAngle = max(dot(halfVector, normal), 0.0);
        specular = pow(specAngle, uShininess);
    }

    
    vec3 colorLinear = uAmbientColor +
                     uDiffuseColor * lambertian * uLightColor * uLightPower / surfaceToLightDistance +
                     uSpecularColor * specular * uLightColor * uLightPower / surfaceToLightDistance;

    // apply gamma correction (assume ambientColor, diffuseColor and specColor
    // have been linearized, i.e. have no gamma correction in them)
    vec3 colorGammaCorrected = pow(colorLinear, vec3(1.0/screenGamma));
    // use the gamma corrected color in the fragment
    
    gl_FragColor = vec4(colorGammaCorrected, 1.0);
    // gl_FragColor.rgb = uAmbientColor;
}